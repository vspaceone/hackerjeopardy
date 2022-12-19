# How To Add Rounds

You need to create a folder with a name for the round, e.g. "XMAS22-Round-2".
In this folder you add a `turn.json` file and one folder for each category. Usually we use four categories.
Your `turn.json` should look something like this:
```
{
"name": "Hackerjeopardy_Loung_and_Chill_2_en",
"categories": ["colors", "local_places", "movies", "persons"],
"comment": "Updated to KIT and english on 11th Dec 2022"
}
```
Most of the things should be self-explainable. Still i'm going to discuss each attribute:
 - name: is a string
 - categories: an array with the foldernames of the categories. Order doesn't matter. The application is shuffeling them anyways.
 - comment: a string used as to further describe the turn.

In each folder you should have a `cat.json` file that defines this category.
It should look like this:
```
{
  "name":"Movies",
  "path":"movies",
  "lang": "en",
  "difficulty": "easy",
  "author": "Max Noppel",
  "licence": "MIT",
  "date": "2019-01-01",
  "email": "max@noppelmax.online",
  "questions":[
    {
      "question": "What is Matrix?",
      "image": "matrix_q.jpeg"
    },
    {
      "question": "What is E.T.?",
      "image": "et_q.jpeg"
    },
    {
      "question": "What is Lord of the Rings?",
      "image": "herrderringe_q.jpeg"
    },
    {
      "question": "What is Game Of Thrones?",
      "image": "gameofthrones_q.jpeg"
    },
    {
      "question": "What is Star Wars?",
      "image": "starwars_q.jpeg"
    }
]}
```
 - `name`: a string, with the name that is show in the top row of the application
 - `path`: a string, the foldername of this category (TODO: we can get rid of this)
 - `lang`: a string, the iso 639-1 code for the used lanuage, e.g. `en` for english, or `de` for german.
 - `difficulty`: a string, should be either `easy`, `medium`, or `hard`.
 - `author`: a string, your name
 - `licence`: a string, define your licence
 - `date`: a string in the format `YYYY-MM-DD` defining the date when you created that category
 - `email`: a string, your email address for feedback and questions
 - `questions`: a ordered array of questions. The first question is worth 100, then 200, and so forth. Each questions is look as follows:
	- `question`: a string
	- `image`: a string, the name of an image in that directory (specified by `path`). Use either `image` or `answer`! Your image can have any format, your browser can parse: png, jpeg, gif, .... It also can have any size. Your image should be to quadratic to ensure a proper layout and corporate design between different categories.
	- `answer`: a string, that answer. Use either `image` or `answer`!


