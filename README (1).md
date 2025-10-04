# Birthday History Portal

A fun, visually-rich website that shows you famous people born, died, movies and anime released on the day you select (or today by default). Features a dark/bright theme toggle and category options.

## Features

- **Birthday Input**: Select any date, or use today.
- **Data Shown**:
    - Famous Births (Wikipedia)
    - Famous Deaths (Wikipedia)
    - Movies Released (Wikipedia, TMDb if API key provided)
    - Anime Released (Jikan API)
- **Theme Toggle**: Sun/Moon icon to switch between dark/light modes.
- **Heavy CSS**: Modern, animated, responsive cards and layout.
- **Category Toggles**: Show/hide each category.
- **Responsive**: Works on desktop and mobile.
- **Self-contained**: No build step, deploy anywhere.

## Deploy

Just upload all files to Netlify, Vercel, GitHub Pages, or any static hosting.

## API Notes

- Movies: For full results, [get a TMDb API key](https://www.themoviedb.org/settings/api) and add it in `script.js` (`API_KEY`).
- Anime: Uses [Jikan](https://jikan.moe/) for currently airing anime.

## Customization

- You can replace the favicon or change color themes in `style.css`.
- To add more data sources or improve accuracy, see comments in `script.js`.

---

Enjoy your personal birthday history portal!