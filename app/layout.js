import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "TutorMatch – Find Your Perfect Tutor",
  description: "A simple tutoring marketplace connecting students with qualified tutors for online and in-person learning.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased font-sans`} style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
