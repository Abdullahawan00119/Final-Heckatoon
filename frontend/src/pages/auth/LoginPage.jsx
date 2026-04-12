import LoginForm from '../../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-8">
      <div className="w-full">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
