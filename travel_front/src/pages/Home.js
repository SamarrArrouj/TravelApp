import React from "react";
import HeroSection from "../components/HeroSection";
import TravelStats from "../components/TravelStats";
import BestDestinations from "../components/BestDestinations";
import BestHotels from "../components/BestHotels";
import Footer from "../components/Footer";
import AboutUsSections from "../components/AboutUsSections";
import ContactSection from "../components/ContactSection";
import Header from "../components/Header";
import FloatingChatbot from "../components/FloatingChatbot";

export default function Home() {
  return (
    <div className="font-sans">
      <Header />
      <HeroSection />
      <TravelStats />
      <BestDestinations />
      <BestHotels />
      <AboutUsSections />
      <ContactSection />
 <Footer />
    <FloatingChatbot />
    </div>
  );
}
