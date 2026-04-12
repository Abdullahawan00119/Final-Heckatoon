import RegisterForm from '../../components/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-8">
      <div className="w-full">
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
