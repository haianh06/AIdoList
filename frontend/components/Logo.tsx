import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  height?: number;
}

const Logo = ({ className = '', height = 40 }: LogoProps) => {
  return (
    <Link href="/dashboard" className={`inline-block ${className}`}>
      <Image
        src="/images/logo.png" 
        alt="AIdoList Logo"
        width={0}
        height={0}
        sizes="100vw"
        style={{ width: 'auto', height: `${height}px` }} 
        priority={true}
      />
    </Link>
  );
};

export default Logo;