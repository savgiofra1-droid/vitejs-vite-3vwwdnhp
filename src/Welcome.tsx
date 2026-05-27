import React from 'react';

export default function Welcome({ setUserName, setIsOnboarded }: any) {
  const selectProfile = (name: string) => {
    localStorage.setItem('userName', name);
    setUserName(name);
    setIsOnboarded(true);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 bg-black">
      <h1 className="text-3xl font-bold mb-12">Chi sei?</h1>
      <div className="flex flex-col gap-6 w-full max-w-sm">
        <button 
          onClick={() => selectProfile('Tizzi')}
          className="p-8 bg-blue-600 rounded-3xl text-2xl font-bold shadow-lg shadow-blue-500/20"
        >
          Sono Tizzi 👦
        </button>
        <button 
          onClick={() => selectProfile('Sofia')}
          className="p-8 bg-pink-500 rounded-3xl text-2xl font-bold shadow-lg shadow-pink-500/20"
        >
          Sono Sofia 👧
        </button>
      </div>
    </div>
  );
}
