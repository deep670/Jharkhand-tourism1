import React, { useState } from "react";

const hotels = [
  {
    id: 1,
    name: "Hotel Sunrise",
    rating: 4.5,
    price: 120,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRX_rc9YafJVvhjeEWq99sCS5ubTtC6jVpI2Q&s",
    description: "A luxurious stay with sunrise views and premium amenities.",
    imgDesc: "Beautiful sunrise over the hotel with glowing skies."
  },
  {
    id: 2,
    name: "Green Valley Resort",
    rating: 3.8,
    price: 90,
    image: "https://pix10.agoda.net/hotelImages/488855/0/f678476c808bdde4dd38ae0812a8af84.jpeg?ce=0&s=414x232",
    description: "Nestled in nature, perfect for family vacations and relaxation.",
    imgDesc: "Green valley view with lush trees and calm surroundings."
  },
  {
    id: 3,
    name: "Lake Breeze Hotel",
    rating: 4.7,
    price: 150,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEDzf2Jb5rqI2dXuwUEVeqRLuYlAObqMUoEi8yJJBa_yM0FI4pKbadIWVa2azRx2rzNuo&usqp=CAU",
    description: "Lake side comfort with world-class food and scenic views.",
    imgDesc: "River waves splashing behind the hotel."
  },
  {
    id: 4,
    name: "City Central Inn",
    rating: 4.2,
    price: 110,
    image: "https://rukmini-ct.flixcart.com/q_75,w_420,h_300,fl_progressive,e_sharpen:80,c_fill,dpr_2,f_auto/ct-hotel-images/places/hotels/cms/2981/298145/images/image_298145_39e3063c-5f2f-45a7-85aa-67548a33057e_proc.jpeg",
    description: "Located in the heart of the city, ideal for business travelers.",
    imgDesc: "Modern building in the center of a bustling city."
  },
  {
    id: 5,
    name: "Mountain Escape Lodge",
    rating: 3.5,
    price: 80,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlBF_jtN_Eq7vwyUexaqdBNapHWeF_ovewpw&s",
    description: "A cozy lodge surrounded by scenic mountains and fresh air.",
    imgDesc: "Snowy mountains surrounding a wooden lodge."
  },
  {
    id: 6,
    name: "Royal Heritage Hotel",
    rating: 4.8,
    price: 200,
    image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/665221374.jpg?k=8ec4de5d3d8a78a56f1a165eca373dd96dc083b3b445d17f1cfd7c1b3742f7e6&o=&hp=1",
    description: "Experience royalty with heritage interiors and fine dining.",
    imgDesc: "Grand royal palace style hotel architecture."
  },
  {
    id: 7,
    name: "Budget Stay Inn",
    rating: 3.2,
    price: 50,
    image: "https://www.kayak.com/rimg/himg/6b/5a/03/expedia_group-106589-221036494-066925.jpg?width=1366&height=768&crop=true",
    description: "Affordable rooms with basic amenities for short stays.",
    imgDesc: "Simple budget-friendly room setup."
  },
  {
    id: 8,
    name: "Lakeside Retreat",
    rating: 4.6,
    price: 140,
    image: "https://media-cdn.tripadvisor.com/media/photo-s/21/68/fd/67/the-world-backwaters.jpg",
    description: "Relax by the lake with spa services and boating activities.",
    imgDesc: "Tranquil lake with boats docked nearby."
  },
  {
    id: 10,
    name: "Forest Canopy Lodge",
    rating: 3.9,
    price: 95,
    image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/60315451.jpg?k=3de8b39c89744d6b735429beb0847d8cbd689e1d097240e2a6fc27f8f7f24673&o=&hp=1",
    description: "Treehouse-style rooms offering jungle adventure experiences.",
    imgDesc: "Treehouse cabins nestled among dense green forest."
  },
  {
    id: 12,
    name: "Riverside Bliss",
    rating: 4.1,
    price: 115,
    image: "https://www.atulyahotels.com/wp-content/uploads/2025/06/18a05cec-6c69-45e6-aa87-3bcb99c6e372.jpeg",
    description: "Riverside rooms with fishing, rafting, and scenic views.",
    imgDesc: "Flowing river with cabins along the banks."
  },
  {
    id: 13,
    name: "Golden Sands Resort",
    rating: 4.9,
    price: 220,
    image: "https://travelogyindia.b-cdn.net/blog/wp-content/uploads/2020/06/oberoi-vanyavilas-sawai-madhopur.jpg",
    description: "Premium beachfront resort with golden sandy beaches.",
    imgDesc: "Golden beach with sun loungers and palm trees."
  },
  {
    id: 14,
    name: "Countryside Inn",
    rating: 3.6,
    price: 70,
    image: "https://media.easemytrip.com/media/hotel/shl-21051215378851/common/commonh4xh8e.jpg",
    description: "Charming inn surrounded by fields and village vibes.",
    imgDesc: "Countryside landscape with farms and cottages."
  },
  {
    id: 15,
    name: "Skyline Tower Hotel",
    rating: 4.0,
    price: 125,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcST8PfyRSMVDQdxqrWvce9FSsISnblSFT7iog&s",
    description: "Modern tower hotel with rooftop dining and skyline views.",
    imgDesc: "Tall modern tower building with city skyline backdrop."
  },
  {
    id: 16,
    name: "Cultural Heritage Inn",
    rating: 4.5,
    price: 135,
    image: "https://picsum.photos/300/200?random=16",
    description: "Traditional décor with local art, music, and cuisine.",
    imgDesc: "Intricate traditional architecture with cultural motifs."
  },
  {
    id: 18,
    name: "Wellness Spa Retreat",
    rating: 4.6,
    price: 180,
    image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2d/bd/5e/46/exterior-view-from-the.jpg?w=900&h=-1&s=1",
    description: "Focus on health, yoga, spa, and rejuvenation therapies.",
    imgDesc: "Spa setup with candles, massage tables, and plants."
  },
  {
    id: 20,
    name: "Backpacker Hostel",
    rating: 3.3,
    price: 40,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6CCGy6W-4ETjjPzN3xUXyxDuiliE0YPNfQw&s",
    description: "Budget-friendly hostel with shared dorms and social vibe.",
    imgDesc: "Colorful bunk beds and a common social lounge."
  }
];

export default function HotelList() {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("");

  const filteredHotels = hotels.filter((hotel) => {
    if (filter === "verified") return hotel.rating > 4;
    if (filter === "notverified") return hotel.rating <= 4;
    return true;
  });

  let sortedHotels = [...filteredHotels];

  // Always show verified hotels on top
  sortedHotels.sort((a, b) => {
    const aVerified = a.rating > 4;
    const bVerified = b.rating > 4;
    if (aVerified && !bVerified) return -1;
    if (!aVerified && bVerified) return 1;
    return 0;
  });

  // Additional sorting based on user selection
  if (sort === "price") {
    sortedHotels.sort((a, b) => a.price - b.price);
  } else if (sort === "rating") {
    sortedHotels.sort((a, b) => b.rating - a.rating);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl text-center font-bold mb-4 mt-[8vh]">Hotel Listings</h1>

      {/* Filters */}
      <div className="flex justify-center space-x-4 mb-6">
        <select
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="all">All</option>
          <option value="verified">Verified</option>
          <option value="notverified">Not Verified</option>
        </select>

        <select
          onChange={(e) => setSort(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">Sort By</option>
          <option value="price">Price (Low to High)</option>
          <option value="rating">Rating (High to Low)</option>
        </select>
      </div>

      {/* Hotel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedHotels.map((hotel) => (
          <div
            key={hotel.id}
            className="border rounded-lg shadow-md overflow-hidden"
          >
            <img
              src={hotel.image}
              alt={hotel.name}
              onError={(e) => (e.target.src = "/fallback.jpg")}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{hotel.name}</h2>
                {hotel.rating > 4 && (
                  <span className="text-green-500 font-bold">✔ Verified</span>
                )}
              </div>
              <p className="text-gray-600 mt-2">{hotel.description}</p>
              <p className="text-sm text-gray-400 italic">{hotel.imgDesc}</p>
              <p className="mt-2 text-sm text-gray-500">
                Rating: {hotel.rating} ⭐ | Price: ₹{hotel.price * 30}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}