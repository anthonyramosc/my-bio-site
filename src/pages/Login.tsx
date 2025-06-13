import { useState } from "react";
import type { FC } from "react";
import {
    Alert,
    Button,
    Card,
    Form,
    Input,
    Layout,
    Space,
    Typography,
} from "antd";
import Cookies from "js-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext.ts";

const { Content } = Layout;

type LocationState = {
    from?: {
        pathname?: string;
    };
};

export const Login: FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuthContext();
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState;

    const onFinish = async (values: {
        email: string;
        password: string;
    }) => {
        setLoading(true);
        setError(null);

        if (!login) {
            setError("Login functionality is not available.");
            setLoading(false);
            return;
        }

        try {
            const response = await login(values.email, values.password);

            if (response.success) {
                const token = Cookies.get("accessToken");
                if (token) {
                    const from = state?.from?.pathname || "/sections";
                    navigate(from, { replace: true });
                } else {
                    setError("Login failed. No token found.");
                }
            } else {
                setError("Login failed. Please check your email and password.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Content className="h-screen flex justify-center items-center" style={{backgroundColor:"#181818"}}>
            <Card className="w-96 p-6 rounded-2xl text-center" style={{backgroundColor:"#2a2a2a"}}>
                <Space direction="vertical" align="center" size="large">
                    <img src="/src/assets/img/img.png" className="rounded-full h-24 w-24" alt="Logo" />

                    <Typography.Title level={4} className="m-0 text-white">
                        Biosites Login
                    </Typography.Title>

                    {error && (
                        <Alert
                            message={error}
                            type="error"
                            showIcon
                            className="mb-4"
                        />
                    )}

                    <Form
                        name="login"
                        onFinish={onFinish}
                        className="w-full"
                        layout="vertical"
                    >
                        <Form.Item
                            name="email"
                            label={<span className="text-gray-300">Email</span>}
                            rules={[
                                { required: true, message: "E-mail required" },
                            ]}
                        >
                            <Input 
                                type="email" 
                                autoComplete="username" 
                                style={{backgroundColor: '#3a3a3a', borderColor: '#4a4a4a', color: 'white'}}
                            />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            label={<span className="text-gray-300">Password</span>}
                            rules={[
                                { required: true, message: "Password required" },
                            ]}
                        >
                            <Input.Password 
                                autoComplete="current-password" 
                                style={{backgroundColor: '#3a3a3a', borderColor: '#4a4a4a', color: 'white'}}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="w-full bg-purple-600 hover:bg-purple-700 border-none"
                                loading={loading}
                            >
                                Sign In
                            </Button>
                        </Form.Item>
                    </Form>
                    <Button type="link" onClick={() => navigate("/register")} className="text-gray-300 hover:text-white">
                        Don't have an account? Register
                    </Button>
                </Space>
            </Card>
        </Content>
    );
};