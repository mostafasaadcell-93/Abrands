/* Abrands catalog. Flavors and protein are read from Abrands' own packaging/posts.
   PRICES ARE PLACEHOLDERS (marked est:1 in the UI) until Abrands confirms them.
   Keep the AB-CONFIG markers: a future owner panel can read and rewrite everything between them. */
window.AB = /*AB-CONFIG-START*/{
 "whatsapp": "",
 "contact": "9617189537",
 "instagram": "https://www.instagram.com/abrands_int/",
 "currency": "USD",
 "pricesConfirmed": false,
 "countries": [
  { "id": "lb", "name": "Lebanon", "flag": "🇱🇧", "note": "Delivery all over Lebanon" },
  { "id": "qa", "name": "Qatar", "flag": "🇶🇦", "note": "Ask for delivery" },
  { "id": "iq", "name": "Iraq", "flag": "🇮🇶", "note": "Ask for delivery" },
  { "id": "jo", "name": "Jordan", "flag": "🇯🇴", "note": "Ask for delivery" },
  { "id": "kw", "name": "Kuwait", "flag": "🇰🇼", "note": "Ask for delivery" }
 ],
 "brands": [
  { "id": "acup", "name": "Acup", "kind": "Protein cups", "line": "Boost · Gain · Recover", "pitch": "Thick protein cream on a crunchy base. Spoon inside.", "color": "#2EC4C6", "ink": "#06292A" },
  { "id": "abar", "name": "Abar", "kind": "Pro Bars", "line": "33% protein", "pitch": "Whey protein bars. No refined sugar, rich in potassium.", "color": "#C88A4A", "ink": "#2A1708" },
  { "id": "abites", "name": "Abites", "kind": "Protein Bites", "line": "4 bites · 90 cal each", "pitch": "Soft bites sweetened with natural honey.", "color": "#B3202C", "ink": "#FFF4E8" },
  { "id": "abutter", "name": "Abutter", "kind": "Peanut butter", "line": "Only peanuts", "pitch": "100% peanuts. Nothing else.", "color": "#4FB3E8", "ink": "#06223A" }
 ],
 "products": [
  { "id": "acup-mango", "brand": "acup", "line": "Protein Bomb", "name": "Mango Passion", "p": 40, "price": 3.5, "img": "p-mango", "color": "#F6A21A", "tags": ["fruity"] },
  { "id": "acup-birthday", "brand": "acup", "line": "Protein Bomb", "name": "Birthday Cake", "p": 40, "price": 3.5, "img": "p-birthday", "color": "#F0567A", "tags": ["sweet"] },
  { "id": "acup-cinnamon", "brand": "acup", "line": "Protein Bomb", "name": "Cinnamon Roll", "p": 40, "price": 3.5, "img": "p-cinnamon", "color": "#C9792F", "tags": ["sweet"] },
  { "id": "acup-coffee", "brand": "acup", "line": "Booster", "name": "Coffee Dream", "p": 25, "price": 3, "img": "p-coffee", "lid": "lid-coffee", "color": "#F08A1C", "tags": ["coffee"] },
  { "id": "acup-double", "brand": "acup", "line": "Booster", "name": "Double Chocolate", "p": 25, "price": 3, "img": "p-double", "color": "#6B3A2A", "tags": ["chocolate"] },
  { "id": "acup-kunafa", "brand": "acup", "line": "Oriental", "name": "Kunafa", "p": 25, "price": 3, "img": "p-kunafa", "lid": "lid-kunafa", "color": "#1E9C86", "tags": ["oriental"] },
  { "id": "acup-dubai", "brand": "acup", "line": "Oriental", "name": "Dubai Treat", "p": 25, "price": 3, "img": "p-dubai", "lid": "lid-dubai", "color": "#8DC34A", "tags": ["oriental", "chocolate"] },
  { "id": "acup-honey", "brand": "acup", "line": "Oriental", "name": "Sindyan Honey", "p": 25, "price": 3, "img": "p-honey", "color": "#F2B230", "tags": ["oriental"] },
  { "id": "acup-crispy", "brand": "acup", "line": "Super Crispy", "name": "Crispy Chocolate", "p": 15, "price": 2.5, "img": "p-crispy", "color": "#3CC4C9", "tags": ["chocolate", "light"] },
  { "id": "abar-dark", "brand": "abar", "line": "Pro Bar", "name": "Dark Chocolate", "pct": 33, "price": 2.5, "img": "p-bar-dark", "tex": "tex-bar-dark", "color": "#4A2A1C", "tags": ["chocolate"] },
  { "id": "abar-caramel", "brand": "abar", "line": "Pro Bar", "name": "Salted Caramel", "pct": 33, "price": 2.5, "img": "p-bar-caramel", "tex": "tex-bar-caramel", "color": "#D9822B", "tags": ["sweet"] },
  { "id": "abar-cheesecake", "brand": "abar", "line": "Pro Bar", "name": "Cheesecake", "pct": 33, "price": 2.5, "img": "p-bar-cheesecake", "tex": "tex-bar-cheesecake", "color": "#D4365A", "tags": ["fruity"] },
  { "id": "abar-vanilla", "brand": "abar", "line": "Pro Bar", "name": "Vanilla", "pct": 33, "price": 2.5, "img": "p-bar-vanilla", "tex": "tex-bar-vanilla", "color": "#E8D4AE", "tags": ["sweet"] },
  { "id": "abites-choco", "brand": "abites", "line": "Protein Bites", "name": "Choco Peanut Butter", "p": 28, "kcal": 90, "unit": "box of 4", "price": 4, "img": "p-bites-choco", "color": "#5A3324", "tags": ["chocolate", "light"] },
  { "id": "abites-honey", "brand": "abites", "line": "Protein Bites", "name": "Honey Peanut Butter", "p": 24, "kcal": 90, "unit": "box of 4", "price": 4, "img": "p-bites-honey", "color": "#B3202C", "tags": ["sweet", "light"] },
  { "id": "abutter-pb", "brand": "abutter", "line": "Abutter", "name": "Peanut Butter", "unit": "jar", "price": 7, "img": "p-butter", "color": "#4FB3E8", "tags": ["spread"] }
 ],
 "box": { "size": 10, "off": 10 }
}/*AB-CONFIG-END*/;
