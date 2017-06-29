import firebase from 'firebase'
import { config } from '../config.js'

firebase.initializeApp(config);

export const posts = firebase.database().ref('posts');

export const provider = new firebase.auth.GithubAuthProvider();

export const addPost = (index, id, title, content, timestamp, comments, showComments) => {
  firebase.database().ref('posts/' + index).set({
  	id: id,
    title: title,
    content: content,
    timestamp: timestamp,
    comments: comments,
    showComments: showComments
  });
}
