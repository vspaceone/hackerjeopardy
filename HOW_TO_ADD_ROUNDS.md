# How To Add Rounds For Our XMAS-Hackerjeopardy

You need to create a folder with a name for the round, e.g. "XMAS22-Round-2".
In this folder you add a `round.json` file and one folder for each category. Usually we use four categories.
Your `round.json` should look something like this:
```
{
"name": "Hackerjeopardy_Loung_and_Chill_2_en",
"categories": ["colors", "local_places", "movies", "persons"],
"comment": "Updated to Karlsruhe and english on 11th Dec 2022"
}
```
Most of the things should be self-explainable. Still i'm going to discuss each attribute:
 - name: a string, with the name of the round
 - categories: an array of string, with the foldernames of the categories. Order doesn't matter. The application is shuffeling them anyways.
 - comment: a string, used as to further describe the round. (optional)

In each category folder you should have a `cat.json` file that defines this category.
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
      "question": "How old is somebody?",
      "answer": "42"
    },
    {
      "question": "What is a nice image?",
      "image": "niceimage.jpeg"
    },
    {
      "question": "How old is somebody?",
      "answer": "42"
    },
    {
      "question": "What is a nice image?",
      "image": "niceimage.jpeg"
    },
    {
      "question": "How old is somebody?",
      "answer": "42"
    }
]}
```
 - `name`: a string, with the name that is show in the top row of the application
 - `lang`: a string, the iso 639-1 code for the used lanuage, e.g. `en` for english, or `de` for german. (optional)
 - `difficulty`: a string, should be either `easy`, `medium`, or `hard`. (optional)
 - `author`: a string, your name. (optional)
 - `licence`: a string, define your licence. (optional)
 - `date`: a string, in the format `YYYY-MM-DD` defining the date when you created that category. (optional)
 - `email`: a string, your email address for feedback and questions. (optional)
 - `questions`: a ordered array of questions: The first question is worth 100, then 200, and so forth. Each questions is look as follows:
	- `question`: a string
	- `image`: a string, the filename of an image to show. The image can have any format (.git,png,jpeg) but should be quadratic. The image should be in the category folder. Use either `image` or `answer`, not both.
	- `answer`: a string, with the answer. Use either `image` or `answer`, not both..


Thats it! If you cannot come up with four categories for one round just send me what you have. I can collect them and merge them together. :)




