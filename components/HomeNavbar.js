import Link from "next/link";
import Image from "next/image";

export default function HomeNavbar() {
  return (
    <nav className="navbar">
      <ul className="nav-items">
        <li className="logo">
          <Link href="/">
            <Image src="/MiniLogo.png" width={150} height={100} alt="Logo" />
          </Link>
        </li>
        <div className="nav-links">
          <li><Link href="../auth/login">Login</Link></li>
          <li><Link href="../auth/signup">Sign Up</Link></li>
          <li><Link href="../profile">Profile</Link></li>
        </div>
      </ul>
    </nav>
  );
}
