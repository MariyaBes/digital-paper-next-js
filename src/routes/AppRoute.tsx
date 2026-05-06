import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppLayout from "../layouts/AppLayout";
import PrivateRoute from "./PrivateRoute";
import RedirectPage from "./RedirectPage";
import LoginPage from "../pages/AuthPage/LoginPage";
import RegisterPage from "../pages/AuthPage/RegisterPage";
import DashboardLayout from "../layouts/DashboardLayout";
import DocumentPage from "../pages/DocumentsPage/DocumentPage";


export default function AppRoute() {
    return (
        <BrowserRouter>
            <AppLayout>
                <Routes>
                    <Route path="/" element={<RedirectPage />} />

                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route
                        element={
                            <PrivateRoute>
                                <DashboardLayout />
                            </PrivateRoute>
                        }
                    />
                        <Route path="/documents" element={<DocumentPage />} />
                        <Route path="/documents/:id" element={<ViewDocumentPage />} />
                </Routes>
            </AppLayout>
        </BrowserRouter>
    )
}
