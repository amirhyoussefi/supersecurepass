// src/app/page.tsx
"use client";
import Image from "next/image";
import styles from "./page.module.css";
import 'dotenv/config'

export default function Home() {

  // Define the function to be called on button click
  const handleClick = async (path: string) => {
    try {
      const response = await fetch(path);
      const data = await response.json();
      console.log(JSON.stringify(data))
      alert(JSON.stringify(data));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="https://nextjs.org/icons/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Generate a Remote Attestation.
          </li>
          <li>Derive a Key.</li>
          <li>Get Last Block.</li>
        </ol>

        <div className={styles.ctas}>
          <a className={styles.primary} target="_blank"
             rel="noopener noreferrer" onClick={() => handleClick('/api/remoteAttestation')}>
            Remote Attestation
          </a>
          <a className={styles.secondary} target="_blank"
             rel="noopener noreferrer" onClick={() => handleClick('/api/deriveKey')}>
            Derive Key
          </a>
          <a className={styles.primary} target="_blank"
             rel="noopener noreferrer" onClick={() => handleClick('/api/getLastBlock')}>
            Last Block
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://bit.ly/dstack-cheat-sheet"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://docs.phala.network/references/hackathon-guides/ethglobal-sf-hackathon-guide"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Guide
        </a>
        <a
          href="https://github.com/Phala-Network/nextjs-viem-dstack-template"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to Code →
        </a>
      </footer>
    </div>
  );
}
