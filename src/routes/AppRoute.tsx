import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppLayout from "../layouts/AppLayout";
import PrivateRoute from "./PrivateRoute";
import RedirectPage from "./RedirectPage";
import LoginPage from "../pages/AuthPage/LoginPage";
import RegisterPage from "../pages/AuthPage/RegisterPage";
import DashboardLayout from "../layouts/DashboardLayout";
import DocumentPage from "../pages/DocumentsPage/DocumentPage";
import CreateDocumentPage from "../pages/DocumentsPage/CreateDocumentPage";
import ViewDocumentPage from "../pages/DocumentsPage/ViewDocumentPage";
import RecyclePage from "../pages/RecyclePage/RecyclePage";
import AuthCallbackPage from "../pages/AuthPage/AuthCallbackPage";
import {OrganizationPage} from "../pages/OrganizationPage/OrganizationPage";
import OrganizationUsersPage from "../pages/OrganizationUsersPage/OrganizationUsersPage";
import AccountPage from "../pages/AccountPage/AccountPage";
import SettingPage from "../pages/SettingPage/SettingPage";


export default function AppRoute() {
    return (
        <BrowserRouter>
            <AppLayout>
                <Routes>
                    <Route path="/" element={<RedirectPage />} />

                    <Route path="/auth/callback" element={<AuthCallbackPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route
                        element={
                            <PrivateRoute>
                                <DashboardLayout />
                            </PrivateRoute>
                        }
                    >
                        <Route path="/documents" element={<DocumentPage />} />
                        <Route path="/create/document" element={<CreateDocumentPage />} />
                        <Route path="/documents/:id" element={<ViewDocumentPage />} />
                        <Route path="/recycle" element={<RecyclePage />} />
                        <Route path="/all-company" element={<OrganizationPage/>} />
                        <Route path="/users" element={<OrganizationUsersPage />} />
                        <Route path="/account" element={<AccountPage />} />
                        <Route path="/setting" element={<SettingPage />} />
                    </Route>
                </Routes>
            </AppLayout>
        </BrowserRouter>
    )
}
