// docx резолвится в CJS-сборку (см. craco.config.js). У неё `exports.X = ...` без
// маркера __esModule, и webpack заворачивает её непредсказуемо. Ищем объект экспортов
// обходом namespace и вложенных `.default`; если не нашли — кидаем диагностику с ключами.
import * as docxImport from 'docx';
import type { JSONContent } from '@tiptap/react';

/* eslint-disable @typescript-eslint/no-explicit-any */
function resolveDocx(): any {
    const visited = new Set<any>();
    const stack: any[] = [docxImport, (docxImport as any).default];

    while (stack.length) {
        const candidate = stack.pop();
        if (!candidate || typeof candidate !== 'object' || visited.has(candidate)) {
            continue;
        }
        visited.add(candidate);

        if (candidate.Packer && candidate.Paragraph && candidate.HeadingLevel) {
            return candidate;
        }
        if (candidate.default) {
            stack.push(candidate.default);
        }
    }

    const ns: any = docxImport;
    throw new Error(
        'docx interop failed: ' +
            JSON.stringify({
                nsType: typeof ns,
                nsKeys: ns ? Object.keys(ns).slice(0, 20) : null,
                hasDefault: !!(ns && ns.default),
                defaultType: ns && ns.default ? typeof ns.default : null,
                defaultKeys: ns && ns.default ? Object.keys(ns.default).slice(0, 20) : null,
            }),
    );
}

const docx = resolveDocx();
/* eslint-enable @typescript-eslint/no-explicit-any */

const {
    AlignmentType,
    BorderStyle,
    Document,
    HeadingLevel,
    LevelFormat,
    Packer,
    Paragraph,
    TextRun,
} = docx;

// Типы-алиасы: имена выше — значения (деструктуризация), для аннотаций берём типы инстансов.
type ParagraphInstance = InstanceType<typeof Paragraph>;
type TextRunInstance = InstanceType<typeof TextRun>;

/**
 * Конвертация документа редактора TipTap (ProseMirror JSON) в реальный OOXML .docx.
 *
 * Зачем .docx: бэкенд `/api/v1/documents/upload` принимает только pdf/doc/docx/jpeg/png,
 * а просмотр (`ViewDocumentPage`) уже умеет показывать .docx через mammoth — получаем
 * полный round-trip без потери редактируемого текста.
 *
 * Поддержанное форматирование: заголовки H1–H6, жирный/курсив/подчёркнутый/зачёркнутый,
 * inline-код, маркированные и нумерованные списки (с вложенностью), выравнивание,
 * цитаты, блок кода, горизонтальная линия, перенос строки.
 */

/** MIME .docx — единая константа для File/валидации/просмотра. */
export const DOCX_MIME =
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/** Ссылка на конфиг нумерации для упорядоченных списков. */
const ORDERED_REF = 'ordered-list';

const HEADING_BY_LEVEL: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
    5: HeadingLevel.HEADING_5,
    6: HeadingLevel.HEADING_6,
};

function mapAlignment(textAlign?: unknown) {
    switch (textAlign) {
        case 'center':
            return AlignmentType.CENTER;
        case 'right':
            return AlignmentType.RIGHT;
        case 'justify':
            return AlignmentType.JUSTIFIED;
        default:
            return undefined;
    }
}

/** Инлайн-узлы блока (text/hardBreak) -> массив TextRun с применёнными марками. */
function inlineRuns(nodes: JSONContent[] | undefined, baseFont?: string): TextRunInstance[] {
    if (!nodes) {
        return [];
    }

    const runs: TextRunInstance[] = [];

    for (const node of nodes) {
        if (node.type === 'hardBreak') {
            runs.push(new TextRun({ break: 1 }));
            continue;
        }

        if (node.type === 'text') {
            const marks = node.marks?.map((mark) => mark.type) ?? [];

            runs.push(
                new TextRun({
                    text: node.text ?? '',
                    bold: marks.includes('bold'),
                    italics: marks.includes('italic'),
                    strike: marks.includes('strike'),
                    underline: marks.includes('underline') ? {} : undefined,
                    font: marks.includes('code') ? 'Courier New' : baseFont,
                }),
            );
        }
    }

    return runs;
}

/** Список (маркированный/нумерованный) -> плоский массив абзацев с уровнями. */
function listToParagraphs(
    listNode: JSONContent,
    kind: 'bullet' | 'ordered',
    level: number,
): ParagraphInstance[] {
    const result: ParagraphInstance[] = [];

    for (const item of listNode.content ?? []) {
        for (const child of item.content ?? []) {
            if (child.type === 'bulletList') {
                result.push(...listToParagraphs(child, 'bullet', level + 1));
            } else if (child.type === 'orderedList') {
                result.push(...listToParagraphs(child, 'ordered', level + 1));
            } else {
                result.push(
                    new Paragraph({
                        alignment: mapAlignment(child.attrs?.textAlign),
                        children: inlineRuns(child.content),
                        ...(kind === 'bullet'
                            ? { bullet: { level } }
                            : { numbering: { reference: ORDERED_REF, level } }),
                    }),
                );
            }
        }
    }

    return result;
}

/** Блочный узел верхнего уровня -> один или несколько абзацев docx. */
function blockToParagraphs(node: JSONContent): ParagraphInstance[] {
    switch (node.type) {
        case 'paragraph':
            return [
                new Paragraph({
                    alignment: mapAlignment(node.attrs?.textAlign),
                    children: inlineRuns(node.content),
                }),
            ];

        case 'heading': {
            const level = Number(node.attrs?.level) || 1;
            return [
                new Paragraph({
                    heading: HEADING_BY_LEVEL[level] ?? HeadingLevel.HEADING_1,
                    alignment: mapAlignment(node.attrs?.textAlign),
                    children: inlineRuns(node.content),
                }),
            ];
        }

        case 'bulletList':
            return listToParagraphs(node, 'bullet', 0);

        case 'orderedList':
            return listToParagraphs(node, 'ordered', 0);

        case 'blockquote':
            // StarterKit держит внутри цитаты абзацы — рендерим их с отступом и линией слева.
            return (node.content ?? []).map(
                (child) =>
                    new Paragraph({
                        alignment: mapAlignment(child.attrs?.textAlign),
                        indent: { left: 720 },
                        border: {
                            left: {
                                style: BorderStyle.SINGLE,
                                size: 12,
                                space: 12,
                                color: 'CCCCCC',
                            },
                        },
                        children: inlineRuns(child.content),
                    }),
            );

        case 'codeBlock': {
            const text = (node.content ?? []).map((t) => t.text ?? '').join('');
            const children: TextRunInstance[] = [];

            text.split('\n').forEach((line, index) => {
                children.push(
                    new TextRun({
                        text: line,
                        font: 'Courier New',
                        break: index > 0 ? 1 : undefined,
                    }),
                );
            });

            return [new Paragraph({ shading: { fill: 'F5F5F5' }, children })];
        }

        case 'horizontalRule':
            return [
                new Paragraph({
                    border: {
                        bottom: {
                            style: BorderStyle.SINGLE,
                            size: 6,
                            space: 1,
                            color: 'CCCCCC',
                        },
                    },
                    children: [],
                }),
            ];

        default:
            // Неизвестный блок: пытаемся вытащить инлайн-содержимое, иначе пропускаем.
            return node.content ? [new Paragraph({ children: inlineRuns(node.content) })] : [];
    }
}

/** Главная точка входа: документ TipTap (getJSON) -> Blob с .docx. */
export function tiptapJsonToDocxBlob(json: JSONContent): Promise<Blob> {
    const children = (json.content ?? []).flatMap(blockToParagraphs);

    const doc = new Document({
        numbering: {
            config: [
                {
                    reference: ORDERED_REF,
                    levels: [0, 1, 2, 3].map((level) => ({
                        level,
                        format: LevelFormat.DECIMAL,
                        text: `%${level + 1}.`,
                        alignment: AlignmentType.LEFT,
                        style: {
                            paragraph: {
                                indent: { left: 720 * (level + 1), hanging: 360 },
                            },
                        },
                    })),
                },
            ],
        },
        sections: [
            {
                // Пустой документ docx должен содержать хотя бы один абзац.
                children: children.length ? children : [new Paragraph({ children: [] })],
            },
        ],
    });

    return Packer.toBlob(doc);
}
