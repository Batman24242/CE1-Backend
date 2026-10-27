// image can be a link or a file like "images/shoe1.jpg"
// if it is empty, a drawn shoe of that color is shown

const products = [
  { id: 1,  name: "Velocity Run 1",    category: "Running",    price: 4999,  rating: 4.6, color: "#e4572e", tag: "New",        image: "" },
  { id: 2,  name: "Cloud Glide",       category: "Running",    price: 6499,  rating: 4.8, color: "#2e86ab", tag: "Best Seller", image: "" },
  { id: 3,  name: "Sprint Pro",        category: "Running",    price: 8999,  rating: 4.7, color: "#111111", tag: "",           image: "" },
  { id: 4,  name: "Marathon Max",      category: "Running",    price: 11999, rating: 4.9, color: "#7b2cbf", tag: "Premium",    image: "" },
  { id: 5,  name: "Court King",        category: "Basketball", price: 7499,  rating: 4.5, color: "#f4a300", tag: "",           image: "https://images.unsplash.com/photo-1559478496-eaef498abbed?w=600&q=70&auto=format&fit=crop" },
  { id: 6,  name: "Dunk Elite",        category: "Basketball", price: 9999,  rating: 4.7, color: "#c1121f", tag: "New",        image: "" },
  { id: 7,  name: "High Rise 23",      category: "Basketball", price: 12999, rating: 4.8, color: "#1b263b", tag: "Premium",    image: "" },
  { id: 8,  name: "Street Classic",    category: "Lifestyle",  price: 3499,  rating: 4.3, color: "#6c757d", tag: "",           image: "https://images.unsplash.com/photo-1679284392805-1b7f8e2e3f21?w=600&q=70&auto=format&fit=crop" },
  { id: 9,  name: "Urban Walker",      category: "Lifestyle",  price: 3999,  rating: 4.4, color: "#2a9d8f", tag: "Sale",       image: "https://images.unsplash.com/photo-1679284392448-e0812fbe3e8b?w=600&q=70&auto=format&fit=crop" },
  { id: 10, name: "Retro Low",         category: "Lifestyle",  price: 5499,  rating: 4.6, color: "#d4a373", tag: "",           image: "https://images.unsplash.com/photo-1679284392409-55f26c6ea7bc?w=600&q=70&auto=format&fit=crop" },
  { id: 11, name: "Flex Trainer",      category: "Training",   price: 4299,  rating: 4.4, color: "#ef476f", tag: "",           image: "" },
  { id: 12, name: "Power Lift X",      category: "Training",   price: 6999,  rating: 4.6, color: "#264653", tag: "New",        image: "" },
  { id: 13, name: "Cross Fit Zero",    category: "Training",   price: 7999,  rating: 4.5, color: "#fb8500", tag: "",           image: "" },
  { id: 14, name: "Daily Cruiser",     category: "Lifestyle",  price: 2999,  rating: 4.2, color: "#8ecae6", tag: "Sale",       image: "" }
];

function shoeSVG(color) {
  return `
  <svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 132 H285 V142 Q285 156 268 156 H40 Q18 156 18 140 Z" fill="#f1f1f1" stroke="#cfcfcf" stroke-width="2"/>
    <path d="M28 132 L38 62 Q42 48 60 52 L98 68 Q130 90 165 90 L232 98 Q280 104 285 132 Z" fill="${color}"/>
    <path d="M232 98 Q280 104 285 132 L238 132 Q240 112 232 98 Z" fill="rgba(0,0,0,0.18)"/>
    <path d="M60 52 Q75 28 100 40 L112 70 L98 68 Z" fill="rgba(0,0,0,0.25)"/>
    <g stroke="#ffffff" stroke-width="4" stroke-linecap="round">
      <line x1="112" y1="76" x2="132" y2="90"/>
      <line x1="132" y1="82" x2="152" y2="96"/>
      <line x1="152" y1="88" x2="172" y2="102"/>
    </g>
    <path d="M70 118 Q120 96 190 112" stroke="#ffffff" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.9"/>
  </svg>`;
}
