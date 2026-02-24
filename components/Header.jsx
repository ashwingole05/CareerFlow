

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { ChevronDown, FileText, GraduationCap, LayoutDashboard, PenBox, StarsIcon } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuContent  
} from './ui/dropdown-menu';
import { checkUser } from '@/lib/checkUser';

const Header = async () => {
    const user =await checkUser();
    return (
        <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60"> 
<nav className="w-full px-8 h-20 flex items-center justify-between">                <Link href='/' >
                    <Image 
                        src="/logo.png" 
                        alt="CareerFlow Logo" 
                        width={260} 
                        height={80} 
                        className="h-16  w-auto object-contain"
                    />
                </Link>

                <div className="flex items-center gap-4">
    <SignedIn>
        <Link href={'/dashboard'}>
            <Button variant="outline" className="hidden md:flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4"/>
                <span className="hidden md:block">Industry Insights</span>
            </Button>
        </Link>
    

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild suppressHydrationWarning> 
                            <Button>
                                <StarsIcon className="h-4 w-4" />
                                <span className="hidden md:block">Growth Tools</span>
                                <ChevronDown className="h-4 w-4" />
                            </Button> 
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>           
                            <DropdownMenuItem>
                                <Link href={"/resume"} className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span > Build Resume</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                 <Link href={"/ai-cover-letter"} className="flex items-center gap-2">
                                <PenBox className="h-4 w-4" />
                               Cover Letter
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                                 <Link href={"/interview"} className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" />
                            Interview Prep
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                     </SignedIn>


                    <SignedOut>
                        <SignInButton>
                            <Button variant="outline"
                            className="border-primary/50 hover:bg-primary/10 hover:text-primary-foreground transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-primary/20">
                                Sign In</Button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton
                        appearance={{
                            elements:{
                                avatarBox:"w-10 h-10",
                                userButtonPopoverCard:"shadow-xl",
                                userPreviewMainIdentifier:"font-semibold",
                            },
                        }}
                        afterSignOutUrl="/" 
                        />
                    </SignedIn>
                </div>
            </nav>
        </header>
    );
};

export default Header;