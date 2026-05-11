import { SignIn } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";

export default function SignInPage() {
  return (
    <div className="bg-muted flex w-full flex-1 items-center justify-center p-6 md:p-10">
      <SignIn
        appearance={{
          theme: [shadcn],
          variables: {
            borderRadius: "0",
            fontFamily: "Space Grotesk",
            fontFamilyButtons: "Geist",
            colorModalBackdrop: "#000000",
          },
        }}
      />
    </div>
  );
}
