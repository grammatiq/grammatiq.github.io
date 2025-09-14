# Mailchimp Subscriber Count Lambda Function

Ez a Lambda függvény lekérdezi a Mailchimp feliratkozók számát és JSON formátumban adja vissza.

## Környezeti változók beállítása

A függvény működéséhez az alábbi környezeti változókat kell beállítani az AWS Lambda környezetben:

- `MAILCHIMP_API_KEY`: A Mailchimp API kulcs
- `MAILCHIMP_SERVER_PREFIX`: A Mailchimp szerver prefix (pl. "us1")
- `MAILCHIMP_LIST_ID`: A Mailchimp lista azonosítója

## Telepítés

1. Hozz létre egy új Lambda függvényt az AWS-ben Python 3.9+ runtime-mal
2. **NINCS szükség külső függőségekre!** A kód csak beépített Python modulokat használ
3. Egyszerűen töltsd fel a `get_subscriber_count.py` fájlt az AWS Lambda-ba
4. Vagy csomagold ZIP fájlba és töltsd fel

## Előnyök külső függőségek nélkül

- **Legkisebb méret**: Csak beépített modulok
- **Nulla függőség**: Nincs `pip install`
- **Leggyorsabb cold start**: Minimális kód betöltés
- **Maximális kompatibilitás**: Bármely Python verzióval működik
- **Egyszerű telepítés**: Csak egy fájl feltöltése

## Válasz formátum

Sikeres válasz (200):
```json
{
    "subscriber_count": 123,
    "success": true
}
```

Hiba esetén (4xx/5xx):
```json
{
    "error": "Hiba leírása",
    "message": "Részletes hibaüzenet",
    "success": false
}
```

## CORS

A függvény CORS headers-eket tartalmaz, így közvetlenül hívható frontend alkalmazásokból.
