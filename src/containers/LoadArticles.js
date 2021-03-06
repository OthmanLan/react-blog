import { connect } from 'react-redux';
import ArticlesList from '../components/ArticlesList';
import { removeFirebase, fetchArticles, editContent } from '../actions/actionCreators';

const mapStateToProps = state => {
	return {
		blogState: state.blogState,
		editor: state.editor
	}
}

const mapDispatchToProps = dispatch => {
	return {
		trashArticle: article => {
			dispatch(removeFirebase(article))
		},
		editArticle: article => {
			dispatch(editContent(article))
		},
		loadPage: index => {
			dispatch(fetchArticles(index))
		}
	}
}

const LoadArticles = connect(mapStateToProps, mapDispatchToProps)(ArticlesList);

export default LoadArticles;