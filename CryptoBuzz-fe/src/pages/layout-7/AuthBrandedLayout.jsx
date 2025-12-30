const AuthBrandedLayout = ({ children }) => {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/media/images/2600x1600/bg-img.webp')",
      }}
    >
      {children}
    </div>
  );
};

export default AuthBrandedLayout;
