import type { Editor } from '@tiptap/react';

interface EditorToolbarProps {
    editor: Editor | null;
}

interface ToolButton {
    key: string;
    label: string;
    title: string;
    isActive?: () => boolean;
    run: () => void;
    disabled?: () => boolean;
}

/**
 * Панель форматирования для TipTap. Кнопки управляют командами редактора;
 * активное состояние подсвечивается классом `is-active`.
 */
export default function EditorToolbar({ editor }: EditorToolbarProps) {
    if (!editor) {
        return null;
    }

    const groups: ToolButton[][] = [
        [
            {
                key: 'bold',
                label: 'Ж',
                title: 'Жирный',
                isActive: () => editor.isActive('bold'),
                run: () => editor.chain().focus().toggleBold().run(),
            },
            {
                key: 'italic',
                label: 'К',
                title: 'Курсив',
                isActive: () => editor.isActive('italic'),
                run: () => editor.chain().focus().toggleItalic().run(),
            },
            {
                key: 'underline',
                label: 'Ч',
                title: 'Подчёркнутый',
                isActive: () => editor.isActive('underline'),
                run: () => editor.chain().focus().toggleUnderline().run(),
            },
            {
                key: 'strike',
                label: 'З',
                title: 'Зачёркнутый',
                isActive: () => editor.isActive('strike'),
                run: () => editor.chain().focus().toggleStrike().run(),
            },
        ],
        [
            {
                key: 'h1',
                label: 'H1',
                title: 'Заголовок 1',
                isActive: () => editor.isActive('heading', { level: 1 }),
                run: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            },
            {
                key: 'h2',
                label: 'H2',
                title: 'Заголовок 2',
                isActive: () => editor.isActive('heading', { level: 2 }),
                run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            },
            {
                key: 'h3',
                label: 'H3',
                title: 'Заголовок 3',
                isActive: () => editor.isActive('heading', { level: 3 }),
                run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            },
            {
                key: 'paragraph',
                label: '¶',
                title: 'Обычный текст',
                isActive: () => editor.isActive('paragraph'),
                run: () => editor.chain().focus().setParagraph().run(),
            },
        ],
        [
            {
                key: 'bulletList',
                label: '•',
                title: 'Маркированный список',
                isActive: () => editor.isActive('bulletList'),
                run: () => editor.chain().focus().toggleBulletList().run(),
            },
            {
                key: 'orderedList',
                label: '1.',
                title: 'Нумерованный список',
                isActive: () => editor.isActive('orderedList'),
                run: () => editor.chain().focus().toggleOrderedList().run(),
            },
            {
                key: 'blockquote',
                label: '”',
                title: 'Цитата',
                isActive: () => editor.isActive('blockquote'),
                run: () => editor.chain().focus().toggleBlockquote().run(),
            },
        ],
        [
            {
                key: 'left',
                label: '⬅',
                title: 'По левому краю',
                isActive: () => editor.isActive({ textAlign: 'left' }),
                run: () => editor.chain().focus().setTextAlign('left').run(),
            },
            {
                key: 'center',
                label: '↔',
                title: 'По центру',
                isActive: () => editor.isActive({ textAlign: 'center' }),
                run: () => editor.chain().focus().setTextAlign('center').run(),
            },
            {
                key: 'right',
                label: '➡',
                title: 'По правому краю',
                isActive: () => editor.isActive({ textAlign: 'right' }),
                run: () => editor.chain().focus().setTextAlign('right').run(),
            },
        ],
        [
            {
                key: 'undo',
                label: '↶',
                title: 'Отменить',
                run: () => editor.chain().focus().undo().run(),
                disabled: () => !editor.can().undo(),
            },
            {
                key: 'redo',
                label: '↷',
                title: 'Повторить',
                run: () => editor.chain().focus().redo().run(),
                disabled: () => !editor.can().redo(),
            },
        ],
    ];

    return (
        <div className="editor-toolbar">
            {groups.map((group, index) => (
                <div className="editor-toolbar__group" key={index}>
                    {group.map((button) => (
                        <button
                            key={button.key}
                            type="button"
                            title={button.title}
                            disabled={button.disabled?.() ?? false}
                            className={`editor-toolbar__btn${
                                button.isActive?.() ? ' is-active' : ''
                            }`}
                            // onMouseDown с preventDefault — чтобы не терять выделение в редакторе.
                            onMouseDown={(event) => {
                                event.preventDefault();
                                button.run();
                            }}
                        >
                            {button.label}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
}
