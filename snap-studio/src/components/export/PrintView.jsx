import { Printer } from "lucide-react";

export default function PrintView({ imageUrl, onPrint }) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Print Photo Strip - Snap! Studio</title>
            <style>
              @page { size: auto; margin: 10mm; }
              body { display: flex; justify-content: center; align-items: center; margin: 0; min-height: 100vh; background: #fff; }
              img { max-height: 95vh; max-width: 95vw; object-fit: contain; }
            </style>
          </head>
          <body>
            <img src="${imageUrl}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  return (
    <button className="btn-control-secondary" onClick={handlePrint}>
      <Printer size={16} />
      <span>Print 2x6 Strip</span>
    </button>
  );
}
