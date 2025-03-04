import Link from "next/link";
import Image from "next/image";

export default function ManagerNavbar() {
  return (
    <nav className="navbar">
      <ul>
      <li className="logo">
          <Link href="/">
            <Image src="/MiniLogo.png" width={150} height={100} alt="Logo" />
          </Link>
        </li>
        <li><Link href="/profile">My Profile</Link></li>
      </ul>
    </nav>
  );
}
