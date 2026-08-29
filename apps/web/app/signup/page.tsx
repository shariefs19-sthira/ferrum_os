import Link from 'next/link';

export default function SignupPage() {
  return (
    <div>
      <h1>Sign Up</h1>
      <form>
        <label htmlFor="name">Full Name:</label>
        <input type="text" id="name" name="name" required />

        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required />

        <label htmlFor="password">Password:</label>
        <input type="password" id="password" name="password" required />

        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}