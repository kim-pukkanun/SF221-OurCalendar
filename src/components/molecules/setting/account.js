import React from 'react';
import axios from 'axios';
import { withTranslation } from 'react-i18next';
import {connect} from "react-redux";
import base64 from "react-native-base64";
import {getUniqueId} from "react-native-device-info";
import {Box, Button, ChevronRightIcon, Divider, Flex, HStack, Image, Modal, Pressable, Text} from 'native-base';
import eventStorage from '../../../utils/eventStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '@env';
import AccountSignIn from '../../atoms/setting/accountSignIn';
import AccountLogout from '../../atoms/setting/accountLogout';

const mapStateToProps = state => ({
    auth: {
        googleAuth: state.auth.googleAuth,
        userInfo: state.auth.userInfo
    }
});

class Account extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            accountModal: false,

            importSuccess: false,
            exportSuccess: false,
            googleSuccess: false
        };
    }

    async onClickImport() {
        const appToken = await AsyncStorage.getItem('appSecretToken');

        axios.get(API_URL + '/user/import', {
            headers: {
                Authorization: appToken,
                Device: base64.encode(getUniqueId())
            }
        }).then(async (res) => {
            if (res.data.events && res.data.todos) {
                await AsyncStorage.setItem('events', JSON.stringify(res.data.events));
                await AsyncStorage.setItem('todos', JSON.stringify(res.data.todos));

                this.setState({importSuccess: true});
            }
        });
    }

    async onClickExport() {
        const events = await eventStorage.getItem('events');
        const todos = await eventStorage.getItem('todos');

        const appToken = await AsyncStorage.getItem('appSecretToken');

        axios.post(API_URL + '/user/export', {
            events: JSON.stringify(events),
            todos: JSON.stringify(todos)
        }, {
            headers: {
                Authorization: appToken,
                Device: base64.encode(getUniqueId())
            }
        }).then((res) => {
            if (res.data.info === 'success') {
                this.setState({exportSuccess: true});
            }
        });
    }

    async onClickGoogle() {
        const appToken = await AsyncStorage.getItem('appSecretToken');

        axios.get(API_URL + '/calendar/list', {
            headers: {
                Authorization: appToken,
                Device: base64.encode(getUniqueId())
            }
        }).then(async (res) => {
            if (res.data) {
                await AsyncStorage.setItem('googleEvents', JSON.stringify(res.data));

                this.setState({googleSuccess: true});
            }
        });
    }

    render() {
        const { t } = this.props;

        return this.props.auth.googleAuth ?
            (
                <>
                    <Pressable onPress={() => this.setState({accountModal: true})} >
                        <HStack paddingTop="3%">
                            <Text width="60%" fontSize="19" fontWeight={700} paddingLeft="14%"> {t('setting.account')}</Text>
                            <Flex width="30%" flexDirection="row" justify="flex-end">
                                <ChevronRightIcon size="8"/>
                            </Flex>
                        </HStack>
                    </Pressable>
                    <Modal isOpen={this.state.accountModal} onClose={() => this.setState({accountModal: false, importSuccess: false, exportSuccess: false, googleSuccess: false})}>
                        <Modal.Content maxWidth="400px" >
                            <Modal.CloseButton />
                            <Modal.Header><Text>{t('setting.account')}</Text></Modal.Header>
                            <Modal.Body>
                                <HStack space={2} mb="6">
                                    <Image size="xs" borderRadius={100} source={{uri: this.props.auth.userInfo.picture}} alt="Profile" />
                                    <Box>
                                        <Text fontSize="md">{this.props.auth.userInfo.name}</Text>
                                        <Text>{this.props.auth.userInfo.email}</Text>
                                    </Box>
                                </HStack>
                                <Box mb="2">
                                    <Button variant="outline" onPress={() => this.onClickImport()}>{t('account.import_cloud.import')}</Button>
                                    {this.state.importSuccess ? (
                                        <Text color="success.500">{t('account.import_cloud.success')}</Text>
                                    ) : (<></>)}
                                </Box>
                                <Box mb="4">
                                    <Button variant="outline" onPress={() => this.onClickExport()}>{t('account.export_cloud.export')}</Button>
                                    {this.state.exportSuccess ? (
                                        <Text color="success.500">{t('account.export_cloud.success')}</Text>
                                    ) : (<></>)}
                                </Box>
                                <Divider mb="4"/>
                                <Box mb="4">
                                    <Button onPress={() => this.onClickGoogle()}>{t('account.google_calendar.import')}</Button>
                                    {this.state.googleSuccess ? (
                                        <Text color="success.500">{t('account.google_calendar.success')}</Text>
                                    ) : (<></>)}
                                </Box>
                                <Divider mb="4"/>
                                <AccountLogout/>
                            </Modal.Body>
                        </Modal.Content>
                    </Modal>
                </>
            ) : (
                <Box width="100%" paddingBottom="2" paddingLeft="15%" paddingRight="12%">
                    <Text width="60%" fontSize="19" fontWeight={700} paddingBottom="2">
                        {t('setting.account')}
                    </Text>
                    <AccountSignIn/>
                </Box>
            );
    }
}
export default connect(mapStateToProps)(withTranslation()(Account));
