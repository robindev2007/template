import { Heading, Section, Text } from "react-email";

import { EmailLayout } from "../components/EmailLayout";

export interface VerifyEmailProps {
  companyName: string;
  otp: string;
  expiryMinutes: number;
  logoUrl?: string;
}

export function VerifyEmail({ companyName, otp, expiryMinutes, logoUrl }: VerifyEmailProps) {
  return (
    <EmailLayout preview="Verify your email address" companyName={companyName} logoUrl={logoUrl}>
      <Heading as="h1" className="m-0 mb-5 text-center text-[32px] font-bold text-fg">
        Verify your email
      </Heading>

      <Text className="mx-auto mb-8 mt-0 max-w-[420px] text-center text-[16px] leading-7 text-fg-2">
        Welcome to {companyName}! To complete your account registration, enter the verification code
        below.
      </Text>

      <Section className="my-10 rounded-lg border border-solid border-border bg-white py-6 text-center">
        <Text className="m-0 text-[40px] font-bold tracking-[12px] text-fg">{otp}</Text>
      </Section>

      <Text className="mx-auto mb-4 max-w-[420px] text-center text-[15px] leading-7 text-fg-2">
        This verification code will expire in <strong>{expiryMinutes} minutes</strong>.
      </Text>

      <Text className="mx-auto mb-0 max-w-[420px] text-center text-[15px] leading-7 text-fg-2">
        For your security, never share this code with anyone. Our team will never ask for it.
      </Text>
    </EmailLayout>
  );
}

VerifyEmail.PreviewProps = {
  companyName: "Acme",
  otp: "483920",
  expiryMinutes: 10,
} satisfies VerifyEmailProps;

export default VerifyEmail;
