import { Button } from '@/components/ui/button';
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { SignInButton, useAuth } from '@clerk/clerk-react';
import { SignOutButton } from '@clerk/nextjs';
import { LogOutIcon, Menu } from 'lucide-react';
import Link from 'next/link';

export default function MenuBtn() {
	const { isSignedIn } = useAuth();
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant='outline'>
					<Menu className='h-6 w-6' />
				</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Menu</SheetTitle>
				</SheetHeader>
				{isSignedIn ? (
					<>
						<div className='grid flex-1 auto-rows-min gap-6 px-4'>
							<div className='grid gap-3'>
								<Button variant='outline'>
									<Link href='/dashboard/profile'>Profile</Link>
								</Button>
							</div>
						</div>
						<SheetFooter>
							<SignOutButton>
								<Button
									variant='ghost'
									className='flex items-center gap-3 justify-start w-full'>
									<LogOutIcon className='w-4 h-4' />
									Logout
								</Button>
							</SignOutButton>
						</SheetFooter>
					</>
				) : (
					<>
						<div className='grid flex-1 auto-rows-min gap-6 px-4'>
							<div className='grid gap-3'>
								<SignInButton mode='modal'>
									<Button
										variant='default'
										className='w-full'>
										Sign In
									</Button>
								</SignInButton>
							</div>
						</div>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}