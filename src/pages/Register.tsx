import { useState, useEffect } from "react";
import type { FC } from "react";
import { Button, Card, Form, Input, Layout, Space, Typography, Alert } from "antd";
import { useNavigate } from "react-router-dom";
import apiService from "../service/apiService";
import { useAuthContext } from "../hooks/useAuthContext";

const { Content } = Layout;

export const Register: FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  // If user is already authenticated, redirect to main page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/sections', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: { email: string; password: string; name: string }) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Register the new user
      await apiService.create("/auth/register", {
        email: values.email,
        password: values.password,
        name: values.name,
        role: "USER",
      });
      setSuccess("Registration successful! You can now log in.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string | string[] } } };
      const errorMessage = error?.response?.data?.message || "Registration failed";
      setError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Content className="h-screen flex justify-center items-center" style={{ backgroundColor: "#181818" }}>
      <Card className="w-96 p-6 rounded-2xl text-center" style={{ backgroundColor: "#2a2a2a" }}>
        <Space direction="vertical" align="center" size="large">
          <img src="/src/assets/img/img.png" className="rounded-full h-24 w-24" alt="Logo" />
          
          <Typography.Title level={4} className="m-0 text-white">
            Create Your Biosite Account
          </Typography.Title>
          
          {error && <Alert message={error} type="error" showIcon className="mb-4" />}
          {success && <Alert message={success} type="success" showIcon className="mb-4" />}
          
          <Form name="register" onFinish={onFinish} className="w-full" layout="vertical">
            <Form.Item 
              name="name" 
              label={<span className="text-gray-300">Name</span>} 
              rules={[
                { required: true, message: "Name required" },
                { min: 3, message: "Name must be at least 3 characters" }
              ]}
            >
              <Input 
                style={{backgroundColor: '#3a3a3a', borderColor: '#4a4a4a', color: 'white'}} 
              />
            </Form.Item>
            
            <Form.Item 
              name="email" 
              label={<span className="text-gray-300">Email</span>} 
              rules={[
                { required: true, message: "E-mail required" },
                { type: 'email', message: "Enter a valid email" }
              ]}
            >
              <Input 
                style={{backgroundColor: '#3a3a3a', borderColor: '#4a4a4a', color: 'white'}} 
              />
            </Form.Item>
            
            <Form.Item 
              name="password" 
              label={<span className="text-gray-300">Password</span>} 
              rules={[
                { required: true, message: "Password required" },
                { min: 6, message: "Password must be at least 6 characters" }
              ]}
            >
              <Input.Password 
                style={{backgroundColor: '#3a3a3a', borderColor: '#4a4a4a', color: 'white'}} 
              />
            </Form.Item>
            
            <Form.Item 
              name="confirmPassword"
              label={<span className="text-gray-300">Confirm Password</span>}
              dependencies={['password']}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password 
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
                Register
              </Button>
            </Form.Item>
          </Form>
          
          <Button 
            type="link" 
            onClick={() => navigate("/login")}
            className="text-gray-300 hover:text-white"
          >
            Already have an account? Login
          </Button>
        </Space>
      </Card>
    </Content>
  );
};
