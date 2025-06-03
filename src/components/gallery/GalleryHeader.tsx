
const GalleryHeader = () => {
  return (
    <header className="bg-gray-900/95 backdrop-blur-sm border-b border-amber-400/20 px-6 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-600 bg-clip-text text-transparent mb-4">
            Galeri Ilustrasi
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Koleksi ilustrasi yang menggambarkan perjalanan emosional dan transformasi Maya
          </p>
        </div>
      </div>
    </header>
  );
};

export default GalleryHeader;
