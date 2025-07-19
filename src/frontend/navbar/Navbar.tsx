"use client"

import {
  SignedIn,
  SignedOut,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';
import React from 'react';
import { Button } from '@/components/ui/button';
import Toggle from './Toggle';
import MenuBtn from '../sidebar/Menu';

export default function Navbar() {

    
  return (
    <nav className='sticky top-0 flex items-center justify-between w-full p-4 dark:bg-gray-600 bg-gray-200'>
      <div>
        {/* <Image src={'...'} fill alt='logo'/>  */}
        {/* logo is added here  */}
        <h3>logo</h3>
      </div>
      <div>
        {/*  making a search bar here ..... */}
        <h3>Search</h3>
      </div>
      <div className='flex gap-4'>
        <Toggle />
        {/* user signin or signup and user button section */}
        <SignedIn>
          <UserButton />
        </SignedIn>
        <span className='hidden lg:block'>
          <SignedOut>
            <SignUpButton mode='modal'>
              <Button>Sign-Up</Button>
            </SignUpButton>
          </SignedOut>
        </span>

        <span className='lg:hidden'>
          <MenuBtn />
        </span>
      </div>
    </nav>
  );
}