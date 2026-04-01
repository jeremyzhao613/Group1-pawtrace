
export const LOCATIONS = [
  {
    id: 'pawprint-cafe',
    name: 'Pawprint Café',
    type: 'Pet café & bakery',
    description: 'A sunny patio with dog-friendly treats, specialty coffee, and hydration stations for furry friends. The best spot for a morning brew with your pup.',
    rating: '4.9 · 520 reviews',
    tags: ['Outdoor seating', 'Hydration bar', 'Treats'],
    hours: '07:00 – 22:00',
    coords: { top: '28%', left: '32%' },
  },
  {
    id: 'lucky-pet-garden',
    name: 'Lucky Pet Garden',
    type: 'Botanical walk',
    description: 'Shaded trails with fountains, cuddle benches, and plenty of bushes to sniff. Cat lovers can relax near the koi pond in the quiet zone.',
    rating: '4.8 · 310 reviews',
    tags: ['Shaded trail', 'Koi pond', 'Quiet zone'],
    hours: '05:30 – 23:00',
    coords: { top: '44%', left: '57%' },
  },
  {
    id: 'pawfect-gear',
    name: 'Pawfect Gear Studio',
    type: 'Pet boutique',
    description: 'Local makers stock custom collars, biodegradable toys, and travel kits. They offer a convenient campus pick-up locker service.',
    rating: '5.0 · 118 reviews',
    tags: ['Artisan goods', 'Pickup locker', 'Accessories'],
    hours: '10:00 – 20:00',
    coords: { top: '20%', left: '70%' },
  },
  {
    id: 'taicang-vet-lounge',
    name: 'Taicang Vet Lounge',
    type: 'Wellness clinic',
    description: 'Quick wellness checks, dental care, and behavior consultations. Features a calming lounge separate from the exam rooms for anxious pets.',
    rating: '4.7 · 412 reviews',
    tags: ['Express exam', 'Dental care', 'Clinic'],
    hours: '09:00 – 18:00',
    coords: { top: '66%', left: '42%' },
  },
  {
    id: 'central-lawn',
    name: 'Central Lawn',
    type: 'Park & Play Area',
    description: 'The heart of the campus. A massive open grass field perfect for frisbee, fetch, and meeting other pet owners. Leash-free zones available.',
    rating: '4.9 · 850 reviews',
    tags: ['Open field', 'Social hub', 'Frisbee'],
    hours: 'Open 24/7',
    coords: { top: '50%', left: '50%' },
  },
  {
    id: 'quiet-corner-library',
    name: 'Library Plaza',
    type: 'Rest Area',
    description: 'A peaceful paved area with plenty of shade near the library. Great for cats in strollers or calm dogs who enjoy people-watching.',
    rating: '4.6 · 200 reviews',
    tags: ['Quiet', 'Paved', 'Shade'],
    hours: '08:00 – 22:00',
    coords: { top: '35%', left: '25%' },
  }
];

export const COMMUNITY_PETS = [
  {
    id: 'cp-1',
    name: 'Milk Tea',
    type: 'Shiba Inu',
    mood: 'Campus café regular, polite tail wags for everyone.',
    location: 'Whisker Bean Café terrace',
    image: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/665b4ca1e15de3e846728ea88ca31fb8.png',
  },
  {
    id: 'cp-2',
    name: 'Nebula',
    type: 'British Shorthair',
    mood: 'Sleeps on textbooks until she hears the can opener.',
    location: 'Studio dorms · Block C',
    image: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/23cd9c9d80bed8a3b3e0b8c536f2e0c0.png',
  },
  {
    id: 'cp-3',
    name: 'Rocket',
    type: 'Border Collie',
    mood: 'Practicing frisbee tricks before hackathon demos.',
    location: 'Central Lawn',
    image: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/1a98a231cfe964a18cdd5f3502fb32bc.png',
  },
  {
    id: 'cp-4',
    name: 'Baozi',
    type: 'Bichon',
    mood: 'Wears matching sweaters with owner every Friday.',
    location: 'Tailwind Study Loft beanbags',
    image: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/a0c9378b7607e96469333185e4376a53.png',
  },
  {
    id: 'cp-5',
    name: 'Nova',
    type: 'Ragdoll',
    mood: 'Hosts silent study sessions on the library stairs.',
    location: 'Library Plaza cushions',
    image: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/fdca457404bba5bf76bb0fd8378c6d8d.png',
  },
  {
    id: 'cp-6',
    name: 'Pudding',
    type: 'Corgi',
    mood: 'Collects compliments near Maple Bark Espresso every morning.',
    location: 'Shuttle hub walkway',
    image: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/95033e3192d642014a951f965ea4ed5b.png',
  },
  {
    id: 'cp-7',
    name: 'Luna',
    type: 'Golden Retriever',
    mood: 'Carries her own leash and loves to greet new students.',
    location: 'North Gate Entrance',
    image: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/bfca1d0d7df0f66b8d2d3b5fc973e99c.png',
  }
];

export const CHAT_CONTACTS = [
  {
    id: 'c1',
    name: 'Lily (Team Lead)',
    avatar: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/95033e3192d642014a951f965ea4ed5b.png',
    pet: 'Mocha',
    petType: 'Corgi',
    lastMsg: 'Want to walk in the central lawn tomorrow?',
    history: [
      { sender: 'them', text: "Hi! I'm Lily and this is Mocha." },
      { sender: 'them', text: "He loves short walks around campus! Are you free tomorrow?" },
      { sender: 'me', text: "Hey Lily! Yes, I'd love to join." },
      { sender: 'them', text: "Awesome, see you at the Central Lawn at 5!" }
    ]
  },
  {
    id: 'c2',
    name: 'Eric (Developer)',
    avatar: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/665b4ca1e15de3e846728ea88ca31fb8.png',
    pet: 'Pixel',
    petType: 'Border Collie',
    lastMsg: 'Pixel learned a new trick!',
    history: [
        { sender: 'them', text: "Pixel just nailed the weave poles!" },
        { sender: 'them', text: "It took us weeks of practice. Check out this video!" },
        { sender: 'me', text: "That's incredible! Pixel is so smart." }
    ]
  },
  {
    id: 'c3',
    name: 'Mia (Designer)',
    avatar: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/23cd9c9d80bed8a3b3e0b8c536f2e0c0.png',
    pet: 'Mochi',
    petType: 'Ragdoll',
    lastMsg: 'Any vet recommendations?',
    history: [
      { sender: 'them', text: "Hey, Mochi has been sneezing a bit." },
      { sender: 'them', text: "Do you know any good vets nearby?" }
    ]
  },
  {
    id: 'c4',
    name: 'Leo (PM)',
    avatar: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/a6892cab6a2e4de1a06ab5df18a4e3ec.png',
    pet: 'Kiko',
    petType: 'Husky',
    lastMsg: 'Planning a weekend dog meetup.',
    history: [
      { sender: 'them', text: "We're getting the pack together this Saturday." },
      { sender: 'them', text: "Kiko needs to burn off some energy!" }
    ]
  },
  {
    id: 'c5',
    name: 'Zoe (Artist)',
    avatar: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/fdca457404bba5bf76bb0fd8378c6d8d.png',
    pet: 'Baozi',
    petType: 'Bichon',
    lastMsg: 'Look at his new sweater!',
    history: []
  }
];

export const INITIAL_USER = {
  name: 'Pet Lover',
  username: '@demo_user',
  avatar: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/fdca457404bba5bf76bb0fd8378c6d8d.png',
  bio: 'Welcome to PawTrace! I love exploring the campus with my furry friends. Always looking for new walking buddies!',
  campus: 'Taicang Campus',
  contact: 'WeChat: pawtrace_fan',
  starSign: 'Libra',
  pets: 1,
  friends: 12,
  visits: 42
};
