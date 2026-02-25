import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";


const IndustryInsightPage = async () => {
    const {isOnboarded} = await getUserOnboardingStatus();
    
         if (!isOnboarded) {
            redirect ("/onboarding");
         }
  return (
    <div>IndustryInsightPage</div>
  )
}

export default IndustryInsightPage;