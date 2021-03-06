import React, { Component } from 'react';
import { Col, Form, FormGroup, FormControl, Button, PageHeader } from 'react-bootstrap';
import { EditorState } from 'draft-js';
import  Editor, { composeDecorators } from 'draft-js-plugins-editor';
import { stateToHTML } from 'draft-js-export-html';
import createImagePlugin from 'draft-js-image-plugin';
import createVideoPlugin from 'draft-js-video-plugin';
import createFocusPlugin from 'draft-js-focus-plugin';
import createResizeablePlugin from 'draft-js-resizeable-plugin';
import createBlockDndPlugin from 'draft-js-drag-n-drop-plugin';

//import startsWith from 'lodash/startsWith';
import isEqual from 'lodash/isEqual';
// import orderBy from 'lodash/orderBy';
import { toInline, toBlock, toMedia } from '../helpers/toolbar';

import buttons from '../data/buttons.json';
import '../css/ArticleForm.css';
import '../css/EditArticles.css';

const focusPlugin = createFocusPlugin();
const resizeablePlugin = createResizeablePlugin();
const blockDndPlugin = createBlockDndPlugin();

const decorator = composeDecorators(
  resizeablePlugin.decorator,
  focusPlugin.decorator,
  blockDndPlugin.decorator
);

const imagePlugin = createImagePlugin({ decorator });
const videoPlugin = createVideoPlugin();

const plugins = [
  blockDndPlugin,
  focusPlugin,
  resizeablePlugin,
  imagePlugin,
  videoPlugin
];

class EditArticles extends Component {
	state = {
		title: '',
		editorState: EditorState.createEmpty(),
		toolbar: []
	}

	changeBody = (editorState) => {

		this.setState({
      editorState,
      toolbar: []
    })

    const styles = editorState.getCurrentInlineStyle()._map._list._tail
    const startKey = editorState.getSelection().getStartKey();
    const selectedBlockType = editorState
    .getCurrentContent()
    .getBlockForKey(startKey)
    .getType()


    if ((selectedBlockType !== 'unstyled') && styles) {
      const newInline = styles.array.map(a => a !== undefined? [a[0], a[1]].join(',') : null)
      const newBlock = [selectedBlockType + ',true']
      const total = newBlock.concat(newInline)
      this.setState({ toolbar: total })
      return
    }

    if (styles) {
      const newInline = styles.array.map(a => a !== undefined? [a[0], a[1]].join(',') : null)
      this.setState({ toolbar: newInline })
    }

    if (selectedBlockType !== 'unstyled') {
      const newBlock = [selectedBlockType + ',true']
      this.setState({ toolbar: newBlock })
    }
	}

	changeTitle = (e) => {
		this.setState({
      title: e.target.value,
      toolbar: []
    })
	}

	submitArticle = (e) => {
    e.preventDefault()

    // Ensure that the article isn't empty (has either text or media)
    if ((!this.state.title.length) || (isEqual(stateToHTML(this.state.editorState.getCurrentContent()), '<p><br></p>'))) {
      return
    }

    const id = this.props.blogState.lastId || 0;
    const title = this.state.title;
    const content = stateToHTML(this.state.editorState.getCurrentContent());
    const timestamp = Date.now();
    const comments = 0;
    const showComments = 'none';

    // Push changes to DB
    this.props.addArticle(id, id+1, title, content, timestamp, comments, showComments)

    // Reset local state
    this.setState({
      title: '',
      editorState: EditorState.createEmpty(),
      toolbar: []
    });
  }

	render() {
		return (
			<div>
			  <div className='editor-wrapper' style={{display: this.props.blogState.editMode? 'block' : 'none'}}>
				  <div id='add-article'>
				    <PageHeader>
				    	<small>Add a new entry</small>
				    </PageHeader>

				    {buttons.block.map((b, index) =>
				      <Button
				        key={index}
				        bsClass='btn-custom'
				        active={this.state.toolbar.indexOf(`${b.id},true`) !== -1? true: false}
				        onClick={() => this.changeBody(toBlock(this.state.editorState, b.id))}>{b.label}
				      </Button>
				    )}

				    {buttons.inline.map((b, index) =>
				      <Button
				        key={index}
				        bsClass='btn-custom'
				        active={this.state.toolbar.indexOf(`${b.id},true`) !== -1? true: false}
				        onClick={() => this.changeBody(toInline(this.state.editorState, b.id))}>{b.label}
				      </Button>
				    )}

				    {buttons.media.map((b, index) =>
				    	<Button
				    		key={index}
				    		bsClass={`btn-class ${b.class}`}
				    		onClick={() => this.changeBody(toMedia(prompt('Add url'), this.state.editorState, b.label === 'image'? imagePlugin : videoPlugin, b.label))}>
				    	</Button>
				    )}
				  </div>

				  <Form horizontal onSubmit={this.submitArticle}>
				   <FormGroup controlId="formBasicText">
				    <Col sm={12}>
				    	<FormControl type="text" placeholder="Give a title to your article..." onChange={this.changeTitle} value={this.state.title} />
				    </Col>
				   </FormGroup>

				   <FormGroup controlId="formControlsTextarea">
				   	<Col sm={12}>
				      <div className='form-control' style={{minHeight:'150px', resize: 'vertical', overflow: 'scroll'}}>
								<Editor
				          editorState={this.state.editorState}
				          plugins={plugins}
				          onChange={this.changeBody}
				          spellCheck={true}
				          placeholder='Share your thoughts...'
				        />
				      </div>
				    </Col>
				   </FormGroup>

				    <FormGroup>
				      <Col sm={12}>
				        <Button type="submit" block={true}>
				          Submit
				        </Button>
				      </Col>
				    </FormGroup>
				  </Form>
				 </div>
			</div>
		)
	}
}

export default EditArticles;
