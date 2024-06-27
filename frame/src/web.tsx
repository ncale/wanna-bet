export const Home = () => {
  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <title>WannaBet Farcaster Frame</title>
        <link
          rel="stylesheet"
          href="https://unpkg.com/modern-normalize@2.0.0/modern-normalize.css"
        />
      </head>

      <body style={{ lineHeight: 1.25, padding: "1rem" }}>
        <h1>🤝 WannaBet Farcaster Frame</h1>
        <p>Welcome!</p>
        <p>WannaBet is a non-custodial peer-to-peer betting platform.</p>
        <p>
          The WannaBet interface is currently only availible through Farcaster Frames, to bet, head back to your Farcaster client and go to the @wannabet page to start a bet.
        </p>
        <p>  
          You can read more about us
          on our <a href="https://github.com/ncale/wanna-bet">github page</a>.
        </p>
      </body>
    </html>
  );
};
