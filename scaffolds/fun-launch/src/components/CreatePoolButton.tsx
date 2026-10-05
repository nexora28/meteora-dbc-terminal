import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from './ui/button';

type CreatePoolButtonProps = {
  className?: string;
};

export const CreatePoolButton = ({ className }: CreatePoolButtonProps) => {
  return (
    <Link
      href="/create-pool"
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
    >
      <span className="iconify ph--rocket-launch-bold h-3.5 w-3.5" />
      <span className="hidden sm:inline">Create Pool</span>
      <span className="sm:hidden">Create</span>
    </Link>
  );
};
