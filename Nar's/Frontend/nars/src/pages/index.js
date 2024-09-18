import Image from "next/image";
import { useState, useEffect } from "react";
import { ShoppingCartIcon, EnvelopeIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "products", "contact"];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom > 100;
        }
        return false;
      });
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-800 text-neutral-800">
      <style jsx global>{`
        body {
          --scrollbar-color: #f97316;
          --scrollbar-bg-color: #d1d5db;
        }
        ::-webkit-scrollbar {
          width: 14px;
        }
        ::-webkit-scrollbar-track {
          background: var(--scrollbar-bg-color);
        }
        ::-webkit-scrollbar-thumb {
          background-color: var(--scrollbar-color);
          border-radius: 7px;
          border: 3px solid var(--scrollbar-bg-color);
        }
      `}</style>

      <header className="bg-neutral-800 py-3 px-4 sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl flex justify-between items-center">
          <div className="flex items-center">
            <Image src="/Logo/narslogo.png" alt="Nar's Logo" width={140} height={140} />
          </div>
          <nav>
            <ul className="flex space-x-6">
              {["home", "about", "products", "contact"].map((section) => (
                <li key={section}>
                  <button 
                    onClick={() => scrollToSection(section)} 
                    className={`text-neutral-100 hover:text-orange-400 transition duration-300 ${activeSection === section ? "text-orange-400 font-bold" : ""}`}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section id="home" className="py-24 min-h-screen flex items-center">
          <div className="container mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-center md:text-left mb-12 md:mb-0">
              <h1 className="text-4xl md:text-5xl text-white font-bold mb-6">Welcome to Nar's School Supplies</h1>
              <p className="text-xl text-gray-100 mb-10">Your one-stop shop for all your educational needs</p>
              <button 
                onClick={() => router.push('/signin')} 
                className="bg-orange-400 text-neutral-100 px-8 py-3 rounded-lg text-lg hover:bg-orange-500 transition duration-300 shadow-md flex items-center justify-center"
              >
                <ShoppingCartIcon className="h-6 w-6 mr-2" />
                Shop Now
              </button>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <Image 
                src="/Logo/Narsbag.png" 
                alt="School Bag" 
                width={500} 
                height={500} 
                className="custom-drop-shadow"
              />
            </div>
          </div>
        </section>

       {/* About Section */}
       <section id="about" className="py-24 min-h-screen flex items-center bg-neutral-800">
          <div className="container mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <Image 
                src="/Logo/narsbuy2.png" 
                alt="About Nar's" 
                width={500} 
                height={400} 
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2 md:pl-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-orange-400">About Nar's</h2>
              <p className="text-lg md:text-xl text-gray-100 leading-relaxed">
                Nar's School Supplies has been serving students and educators for over 20 years. 
                We pride ourselves on offering high-quality products at affordable prices, 
                ensuring that everyone has access to the tools they need for success.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section id="products" className="py-24 min-h-screen flex items-center">
          <div className="container mx-auto max-w-7xl px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-orange-400">Featured Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Product Card 1: Notebook */}
              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition duration-300">
                <Image src="/ImageItems/bignote.png" alt="Notebook" width={300} height={200} className="mb-6 rounded mx-auto" />
                <h3 className="text-xl font-semibold mb-3 text-orange-400">Premium Notebook</h3>
                <p className="text-neutral-600 mb-6">High-quality paper for all your note-taking needs</p>
                <button className="bg-orange-400 text-neutral-100 px-4 py-2 rounded hover:bg-orange-500 transition duration-300 w-full shadow-sm">
                  Learn More
                </button>
              </div>
              
              {/* Product Card 2: Pen */}
              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition duration-300">
                <Image src="/ImageItems/Pen.png" alt="Pen" width={300} height={200} className="mb-6 rounded mx-auto" />
                <h3 className="text-xl font-semibold mb-3 text-orange-400">Smooth Writing Pen</h3>
                <p className="text-neutral-600 mb-6">Ergonomic design for comfortable, smooth writing</p>
                <button className="bg-orange-400 text-neutral-100 px-4 py-2 rounded hover:bg-orange-500 transition duration-300 w-full shadow-sm">
                  Learn More
                </button>
              </div>
              
              {/* Product Card 3: School Bag */}
              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition duration-300">
                <Image src="/ImageItems/Bag.png" alt="School Bag" width={300} height={200} className="mb-6 rounded mx-auto" />
                <h3 className="text-xl font-semibold mb-3 text-orange-400">Durable School Bag</h3>
                <p className="text-neutral-600 mb-6">Spacious and sturdy bag for all your school essentials</p>
                <button className="bg-orange-400 text-neutral-100 px-4 py-2 rounded hover:bg-orange-500 transition duration-300 w-full shadow-sm">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section id="contact" className="py-24 min-h-screen flex items-center bg-neutral-800">
          <div className="container mx-auto max-w-7xl px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-orange-400">Ready to get started?</h2>
            <p className="text-xl text-gray-100 mb-10">Contact us today to learn more about our products and services.</p>
            <button className="bg-orange-400 text-neutral-100 px-8 py-3 rounded-lg text-lg hover:bg-orange-500 transition duration-300 shadow-md flex items-center justify-center mx-auto">
              <EnvelopeIcon className="h-6 w-6 mr-2" />
              Contact Us
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-neutral-800 text-neutral-100 py-6">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <p>&copy; 2024 Nar's School Supplies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}