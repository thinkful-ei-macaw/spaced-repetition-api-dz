const express = require("express");
const LanguageService = require("./language-service");
const { requireAuth } = require("../middleware/jwt-auth");
const jsonBodyParser = express.json();

const languageRouter = express.Router();

languageRouter.use(requireAuth).use(async (req, res, next) => {
  try {
    const language = await LanguageService.getUsersLanguage(
      req.app.get("db"),
      req.user.id
    );

    if (!language)
      return res.status(404).json({
        error: `You don't have any languages`,
      });

    req.language = language;
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.get("/", async (req, res, next) => {
  try {
    const words = await LanguageService.getLanguageWords(
      req.app.get("db"),
      req.language.id
    );

    res.json({
      language: req.language,
      words,
    });
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.get("/head", async (req, res, next) => {
  try {
    const nextWord = await LanguageService.getNextWord(
      req.app.get("db"),
      req.language.id
    );
    // console.log(nextWord);
    res.json({
      answer: nextWord.translation,
      nextWord: nextWord.original,
      totalScore: req.language.total_score,
      wordCorrectCount: nextWord.correct_count,
      wordIncorrectCount: nextWord.incorrect_count,
    });
    next();
  } catch (error) {
    next(error);
  }
  // res.send('implement me!')
});
// languageRouter
//   .use(requireAuth)
//   .route('/guess')
//   .post(jsonBodyParser, async (req, res, next) => {
//     const {
//       guess
//     } = req.body;

//     if (!guess) {
//       return res.status(400).send({
//         error: "Missing 'guess' in request body"
//       })
//     }
//     try {
//       const words = await LanguageService.getLanguageWords(
//         req.app.get('db'), req.language.id
//       )
//       let list = await LanguageService.createLinkedList(words, req.language)

//       let head = list.head;
//       let answer = list.head.value.translation;
//       let nextWord = head.next.value.original;
//       let correct_count = head.next.value.correct_count;
//       let memory_value = head.value.memory_value;

//       let isCorrect;

//       if (guess.toLowerCase() === list.head.value.translation.toLowerCase()) {
//         isCorrect = true;
//         req.language.total_score += 1;
//         head.value.correct_count += 1;
//         memory_value *= 2;
//         head.value.memory_value = memory_value;
//         list.head = head.next;
//         if (memory_value > 9) {
//           memory_value = 9
//           head.value.memory_value = memory_value;
//         }
//         list.insertAt(head.value, memory_value)
//       } else {
//         isCorrect = false;
//         list.head.value.incorrect_count += 1;
//         head.value.memory_value = 1;
//         list.head = head.next;
//         list.insertAt(head.value, memory_value)
//       };

//       let results = {
//         nextWord: nextWord, 
//         totalScore: req.language.total_score, 
//         wordCorrectCount: correct_count, 
//         wordIncorrectCount: list.head.value.incorrect_count,
//         answer: answer,
//         isCorrect: isCorrect,
        
//       };

//       let updateArray = [];
//       let current = list.head;
//       while (current.next !== null) {
//         updateArray = [...updateArray, current.value];
//         current = current.next;
//       }
//       updateArray = [...updateArray, current.value];
//       await LanguageService.insertWord(req.app.get('db'), updateArray, req.language.id, req.language.total_score);

//       res.status(200).json(results);
//       next();
//     } catch (error) {
//       next(error);
//     }
//   });

languageRouter
  .use(requireAuth)
  .route("/guess")
  .post(jsonBodyParser, async (req, res, next) => {
    const guess = req.body.guess;
    if (!guess) {
      return res.status(400).send({ error: "Missing 'guess' in request body" });
    }
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get("db"),
        req.language.id
      );
      const language = await LanguageService.getUsersLanguage(
        req.app.get("db"),
        req.user.id
      );
      let list = await LanguageService.createLinkedList(words, language);
      let head = list.head;
      let answer = list.head.value.translation;
      let memory_value = head.value.memory_value;

      let isCorrect;
      if (guess === answer) {
        isCorrect = true;
        req.language.total_score += 1;
        head.value.correct_count += 1;
        memory_value *= 2;
        head.value.memory_value = memory_value;
        list.head = head.next;
        list.insertAt(head.value, memory_value);
      } else {
        isCorrect = false;
        head.value.memory_value = 1;
        list.head = head.next;
        list.insertAt(head.value, memory_value);
      }
      let feedback = {
        answer: answer,
        isCorrect: isCorrect,
        totalScore: req.language.total_score,
        wordCorrectCount: head.value.correct_count,
        wordIncorrectCount: head.value.incorrect_count,
      };
      await LanguageService.updates(
        req.app.get("db"),
        list,
        req.language.id,
        req.language.total_score
      );
      res.json( {feedback} );
    } catch (error) {
      next(error);
    }
  });
  
module.exports = languageRouter;
