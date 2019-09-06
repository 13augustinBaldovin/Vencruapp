import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import ImportCsvForm from './ImportClientCsvForm';
import PageDialog from '../presentation/PageDialogs';
import { bindActionCreators } from 'redux';
import { ActionCreators } from '../../data/actionCreators';
import OverlayProgress from '../presentation/OverlayProgress';
import { CREATE_CLIENT } from '../../configs/api.config';
import find from 'lodash/find';
import { storageGet } from '../../helpers/Storage';
import { STORAGE_KEYS } from '../../configs/storage.config';

/**
 * component template
 */
let Template = ({fn, isFetching}) => (
    <PageDialog
        backdropClose={false}
        escClose={false} 
        show={true}
        afterDismiss={() => fn.handleAfterDismiss()}
        className='create-client-page-dialog csv-import'
        onDismiss={method => fn.handlePageDialogDismiss(method)}
    >
        <ImportCsvForm
            setRef={(ref) => fn.setForm(ref)}
            title='Import CSV'
            submitLabel='Save'
            onCancel={() => fn.handleCancelPress()}
            onSubmit={(data) => fn.handleSubmit(data)}
            disabled={isFetching}
        />
        { isFetching && <OverlayProgress/> }
    </PageDialog>
);

class ImportCsv extends React.Component {
    state = {
        isFetching: false
    };

    componentDidUpdate(prevProps, prevState){
        if(prevProps.clientCreate.isFetching && !this.props.clientCreate.isFetching){
            if(this.props.clientCreate.errorMessage){
                this.props.showSnackbar(this.props.clientCreate.errorMessage, {variant: 'error'});
            }
            else{
                this.props.showSnackbar('New client created.', {variant: 'success'});
                this.created();
            }
        }
    }

    render(){
        return <Template 
            {...this.prps()} 
            fn={this.fn()} 
        />;
    }

    fn = () => ({
        handleSubmit: (data) => this.handleSubmit(data),
        handleAfterDismiss: () => this.handleAfterDismiss(),
        handlePageDialogDismiss: (method) => this.handlePageDialogDismiss(method),
        setForm: (form) => this.setForm(form),
        handleCancelPress: () => this.handleCancelPress()
    })

    prps = () => ({
        isFetching: this.props.clientCreate.isFetching
    })

    setForm(form){
        this.form = form;
    }


    handleSubmit(data){
        console.log('imporrrtttt',data);
        console.log( localStorage['ClientImportData'], " localStorage['ClientImportData']");
    }

    handleAfterDismiss(){

    }

    handleCancelPress(){
        if(this.props.clientCreate.isFetching){
            return;
        }
        if( !this.form ||
            !this.form.isUpdated()
        ){
            this.cancel();
            return; 
         }
         this.props.showAlertDialog(
             ` `, 
             'Are you sure, you want discard your unsaved client info?',
             [
                 {text: 'No'},
                 {text: 'Yes, discard', onClick: this.cancel.bind(this) }
             ]
         )
    }

    handlePageDialogDismiss(method){
        switch(method){
            case 'backdrop':
            case 'escape':
                this.handleCancelPress();
            break;
        }
    }

    cancel(){
    	if(typeof this.props.onCancel === 'function'){
    		this.props.onCancel();
    		return;
    	}
    	this.props.history.goBack();
    }

    created(){
    	if(typeof this.props.onCreated === 'function'){
    		this.props.onCreated(
    			this.props.clientCreate.data
    		);
    		return;
    	}
    	this.props.history.goBack();
    }
}

const mapStateToProps = ({userInfo, clientCreate}) => ({
    userInfo, 
    clientCreate
})

const mapDispatchToProps = (dispatch) => bindActionCreators({
    showAlertDialog: ActionCreators.showAlertDialog,
    showSnackbar: ActionCreators.showSnackbar,
    doCreateClient: ActionCreators.doCreateClient
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ImportCsv));