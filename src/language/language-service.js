const knex = require("knex");
const LinkedList = require("../linked-list/linked-list");
const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from("language")
      .select(
        "language.id",
        "language.name",
        "language.user_id",
        "language.head",
        "language.total_score"
      )
      .where("language.user_id", user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from("word")
      .select(
        "id",
        "language_id",
        "original",
        "translation",
        "next",
        "memory_value",
        "correct_count",
        "incorrect_count"
      )
      .where({ language_id });
  },

  createLinkedList(array, language) {
    let list = new LinkedList();
    let curr = list.find(word => word.id === language.head);

    list.insertLast(curr);

    // while(curr.next !== null){
    while (curr.next) {
      curr = list.find(word => word.id === curr.next);
      list.insertLast(curr);
    }
    return list;
  },

  getNextWord(db, language_id) {
    return db
      .from("word")
      .join("language", "word.id", "language.head")
      .select(
        "word.original",
        "word.language_id",
        "word.correct_count",
        "word.incorrect_count",
        "language.total_score"
      )
      .where({ language_id })
      .first();
  },



  getCurrentWord(wordList) {
    return wordList.head;
  },

  // write function that takes ll as argument and saves to database
  updates(db, list, user_id) {
    return db.transaction(async trx => {
      let curr = list.head;

      await trx
        .into("language")
        .where({ user_id })
        .update({ head: curr.value.id });

      while (curr) {
        console.log(curr.next.next);
        await trx
          .into("word")
          .where({ id: curr.next.next.value.id })
          .update({
            next: curr.next ? curr.next.next.value.id : knex.raw("DEFAULT"),
          });
        curr = curr.next;
      }
    });
  },
  insertWord(db, words, language_id, total_score) {
    return db
      .transaction(async trx => {
        return Promise
          .all([trx('language')
            .where({
              id: language_id
            })
            .update({
              total_score,
              head: words[0].id
            }),
            ...words.map((word, index) => {
              if (index + 1 >= words.length) {
                word.next = null;
                words[index - 1].next = word
              } else {
                word.next = words[index + 1].id;
              }
              return trx('word').where({
                id: word.id
              }).update({
                ...word
              })
            })
          ])

      })
  },

};



module.exports = LanguageService;
