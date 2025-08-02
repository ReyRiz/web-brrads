import React from 'react';

const TestTailwind = () => {
  return (
    <div className="bg-red-500 text-white p-4 m-4 rounded-lg">
      <h1 className="text-2xl font-bold">Test Tailwind CSS</h1>
      <p className="text-sm">Jika Anda melihat kotak merah ini dengan teks putih, maka Tailwind CSS sudah bekerja!</p>
      <div className="bg-blue-500 p-2 mt-2 rounded">
        <span className="text-yellow-300">CSS styling bekerja!</span>
      </div>
    </div>
  );
};

export default TestTailwind;
