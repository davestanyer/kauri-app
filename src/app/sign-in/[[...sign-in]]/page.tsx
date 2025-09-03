import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Kauri Wine
          </h1>
          <p className="text-gray-600">
            Sign in to access your inventory dashboard
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: "bg-gray-900 hover:bg-gray-800",
              card: "shadow-lg"
            }
          }}
        />
      </div>
    </div>
  );
}