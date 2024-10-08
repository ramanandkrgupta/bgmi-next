"use client"; // Ensure this is at the top

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Trophy, Users, Settings } from 'lucide-react'; // Ensure correct named imports
import { Button } from '@/components/ui/button'; // Check if it's default or named export
import Link from 'next/link'; // Import Link from Next.js

const BottomNav = () => {
  return (
    <motion.nav
      className="sticky bottom-0 bg-white shadow-lg"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex justify-around p-2">
        {[
          { icon: <Home className="h-6 w-6 mb-1" />, label: "Home", href: "/" },
          { icon: <Trophy className="h-6 w-6 mb-1" />, label: "Match", href: "/my-match" },
          { icon: <Users className="h-6 w-6 mb-1" />, label: "Teams", href: "/my-teams" },
          { icon: <Settings className="h-6 w-6 mb-1" />, label: "Settings", href: "/profile" },
        ].map((item, index) => (
          <Link key={index} href={item.href} passHref>
            <Button variant="ghost" size="icon" className="flex flex-col items-center">
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </motion.nav>
  );
};

export default BottomNav;