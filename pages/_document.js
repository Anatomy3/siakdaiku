import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Favicon dan App Icons */}
          <link rel="icon" href="/daiku/logo.png" type="image/png" />
          <link rel="apple-touch-icon" href="/daiku/logo.png" />

          {/* Meta Tags */}
          <meta name="description" content="Daiku - Spesialis desain interior dan eksterior serta furniture berkualitas untuk rumah, kantor, dan usaha." />
          <meta name="theme-color" content="#4CAF50" />

          {/* Fonts */}
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;