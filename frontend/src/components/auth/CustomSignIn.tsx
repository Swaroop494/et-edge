"use client";

import * as React from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  rememberMe: z.boolean().default(false).optional(),
});

export function CustomSignIn() {
  const { client, setActive, loaded } = useClerk();
  const signIn = client?.signIn;
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!loaded || !signIn) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.create({
        identifier: values.email,
        // @ts-ignore
        password: values.password,
      });

      if (result.status === "complete") {
        // @ts-ignore
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        // Log the user in to handle further steps if any (MFA, etc)
        console.log("Sign in incomplete", result);
        setError("Sign in requires additional steps not supported here.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.errors?.[0]?.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!loaded || !signIn) return;
    setIsGoogleLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: any) {
      console.error(err);
      setError(err.errors?.[0]?.message || "Failed to authenticate with Google.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/95">
      <div className="w-full max-w-6xl h-full lg:h-[800px] flex flex-col lg:flex-row bg-white rounded-[2rem] overflow-hidden shadow-2xl relative">
        {/* Left Side (Image/Gradient) */}
        <div className="relative hidden w-full lg:flex lg:w-1/2 p-10 flex-col justify-between overflow-hidden rounded-[2rem] bg-black m-2">
          {/* Background gradient image effect - matching the reference */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,_hsl(var(--electric-violet)_/_0.6)_0%,_transparent_50%),radial-gradient(circle_at_100%_0%,_hsl(var(--critical)_/_0.6)_0%,_transparent_50%),radial-gradient(circle_at_50%_100%,_hsl(var(--neon-cyan)_/_0.6)_0%,_transparent_50%)]" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-black/80" />
            {/* Simulation of the wavy texture */}
            <svg
              className="absolute inset-0 w-full h-full opacity-60 mix-blend-overlay"
              xmlns="http://www.w3.org/2000/svg"
            >
              <filter id="noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
              </filter>
              <rect width="100%" height="100%" filter="url(#noise)" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
          </div>

          {/* Top text */}
          <div className="relative z-20 flex items-center gap-4">
            <span className="text-white/70 text-xs font-semibold tracking-[0.2em] uppercase">
              Where news meets action 
            </span>
            <div className="h-[1px] w-12 bg-white/30" />
          </div>

          {/* Bottom text block */}
          <div className="relative z-20 mt-auto pb-8 pr-12">
            <h1 className="text-5xl lg:text-[4rem] font-serif text-white leading-[1.1] tracking-tight mb-6">
              The
              <br />
              Economic
              <br />
              Edge You Need
            </h1>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm font-medium">
              Contextualizing global news into actionable insights for the modern investor.
            </p>
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="flex w-full lg:w-1/2 flex-col justify-center items-center p-8 sm:p-12 lg:p-24 bg-white relative">
          
          {/* Logo (Top Center) */}
          <div className="absolute top-10 left-0 right-0 flex justify-center items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <Image 
                src="/favicon.ico" 
                alt="ET EDGE Logo" 
                width={24} 
                height={24} 
                className="object-contain"
              />
            </div>
            <span className="font-semibold text-lg text-black tracking-tight">ET EDGE</span>
          </div>

          <div className="w-full max-w-[400px]">
            {/* Heading */}
            <div className="text-center mb-10">
              <h2 className="text-[2.5rem] font-serif text-black leading-tight mb-2 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-gray-500 text-[13px]">
                Enter your email and password to access your account
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 text-center">
                {error}
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black font-medium text-[13px]">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          className="bg-[#F7F7F9] border-0 rounded-xl h-12 px-4 shadow-none focus-visible:ring-1 focus-visible:ring-black/20 text-[14px] text-black placeholder:text-gray-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black font-medium text-[13px]">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="bg-[#F7F7F9] border-0 rounded-xl h-12 px-4 shadow-none focus-visible:ring-1 focus-visible:ring-black/20 text-[14px] text-black pr-10 placeholder:text-gray-400"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between pt-1 pb-2">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-gray-300 rounded-[4px] data-[state=checked]:bg-black data-[state=checked]:border-black"
                          />
                        </FormControl>
                        <label className="text-[13px] text-gray-500 font-medium cursor-pointer">
                          Remember me
                        </label>
                      </FormItem>
                    )}
                  />
                  <Link
                    href="/forgot-password"
                    className="text-[13px] text-gray-500 font-medium hover:text-black transition-colors"
                  >
                    Forgot Password
                  </Link>
                </div>

                <div className="space-y-4 pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading || !loaded || !signIn}
                    className="w-full bg-black text-white hover:bg-black/90 h-12 rounded-xl text-[14px] font-semibold tracking-wide"
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isGoogleLoading || !loaded || !signIn}
                    onClick={handleGoogleSignIn}
                    className="w-full bg-white text-black border-gray-200 hover:bg-gray-50 h-12 rounded-xl text-[14px] font-semibold tracking-wide flex items-center justify-center gap-2"
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                          <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                          </g>
                        </svg>
                        Sign In with Google
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <span className="text-gray-500 text-[13px]">
                Don't have an account?{" "}
                <Link href="/sign-up" className="text-black font-semibold hover:underline">
                  Sign Up
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
