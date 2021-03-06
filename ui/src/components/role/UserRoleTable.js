/*
 * Copyright 2020 Verizon Media
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import styled from '@emotion/styled';
import Icon from '../denali/icons/Icon';
import { colors } from '../denali/styles';
import DeleteModal from '../modal/DeleteModal';
import Alert from '../denali/Alert';
import { MODAL_TIME_OUT } from '../constants/constants';
import DateUtils from '../utils/DateUtils';
import RequestUtils from '../utils/RequestUtils';

const StyleTable = styled.div`
    width: 100%;
    border-spacing: 0 15px;
    display: table;
    border-collapse: separate;
    border-color: grey;
`;

const TableHeadStyled = styled.div`
    border-bottom: 2px solid rgb(213, 213, 213);
    color: rgb(154, 154, 154);
    font-size: 0.8rem;
    vertical-align: top;
    text-transform: uppercase;
    padding: 5px 0px 5px 15px;
    word-break: break-all;
    display: flex;
`;

const LeftMarginSpan = styled.span`
    margin-right: 10px;
    vertical-align: bottom;
`;

const TDStyledMember = styled.div`
    background-color: ${(props) => props.color};
    text-align: ${(props) => props.align};
    padding: 5px 0 5px 15px;
    vertical-align: middle;
    word-break: break-all;
    width: 70%;
`;

const TDStyledIcon = styled.div`
    background-color: ${(props) => props.color};
    text-align: ${(props) => props.align};
    padding: 5px 0 5px 15px;
    vertical-align: middle;
    word-break: break-all;
    width: 15%;
`;

const TrStyled = styled.div`
    box-sizing: border-box;
    margin-top: 10px;
    box-shadow: 0 1px 4px #d9d9d9;
    border: 1px solid #fff;
    -webkit-border-image: none;
    border-image: none;
    -webkit-border-image: initial;
    border-image: initial;
    display: flex;
`;

const StyledTd = styled.div`
    width: 100%;
`;

const StyledTable = styled.div`
    width: 100%;
`;

const StyledUserCol = styled.div`
    text-align: ${(props) => props.align};
    width: 70%;
`;

const StyledIconCol = styled.div`
    text-align: ${(props) => props.align};
    width: 15%;
`;

const FlexDiv = styled.div`
    display: flex;
`;

export default class UserRoleTable extends React.Component {
    constructor(props) {
        super(props);
        this.api = props.api;
        this.deleteRoleCancel = this.deleteRoleCancel.bind(this);
        this.saveJustification = this.saveJustification.bind(this);
        this.loadRoleByUser();
        this.state = {
            list: {},
            loaded: 'todo',
            expand: {},
            contents: {},
            showDelete: false,
            expandTable: {},
            showSuccess: false,
            searchText: props.searchText,
        };
        this.dateUtils = new DateUtils();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.searchText !== this.props.searchText) {
            this.setState({
                searchText: this.props.searchText,
            });
        }
    }

    deleteItem(name, memberName) {
        this.setState({
            showDelete: true,
            deleteName: name,
            deleteMemberName: memberName,
            deleteMember: false,
        });
    }

    deleteItemMember(name) {
        this.setState({
            showDelete: true,
            deleteName: name,
            deleteMember: true,
        });
    }

    onSubmitDeleteMember(domain) {
        if (
            this.props.justificationRequired &&
            (this.state.deleteJustification === undefined ||
                this.state.deleteJustification.trim() === '')
        ) {
            this.setState({
                errorMessage: 'Justification is required to delete a member',
            });
            return;
        }
        this.api
            .deleteRoleMember(
                domain,
                this.state.deleteName,
                this.state.deleteJustification
                    ? this.state.deleteJustification
                    : 'deleted using Athenz UI',
                this.props._csrf
            )
            .then(() => {
                this.loadRoleByUser();
                this.setState({
                    showDelete: false,
                    showSuccess: true,
                    errorMessage: null,
                });
                setTimeout(
                    () =>
                        this.setState({
                            showSuccess: false,
                        }),
                    MODAL_TIME_OUT
                );
            })
            .catch((err) => {
                this.setState({
                    errorMessage: RequestUtils.xhrErrorCheckHelper(err),
                });
            });
    }

    onSubmitDelete(domain) {
        if (
            this.props.justificationRequired &&
            (this.state.deleteJustification === undefined ||
                this.state.deleteJustification.trim() === '')
        ) {
            this.setState({
                errorMessage:
                    'Justification is required to delete a member from roles',
            });
            return;
        }
        this.api
            .deleteMember(
                domain,
                this.state.deleteName,
                this.state.deleteMemberName,
                this.state.deleteJustification
                    ? this.state.deleteJustification
                    : 'deleted using Athenz UI',
                false,
                'role',
                this.props._csrf
            )
            .then(() => {
                this.loadRoleByUser();
                this.setState({
                    showDelete: false,
                    showSuccess: true,
                    errorMessage: null,
                });
                setTimeout(
                    () =>
                        this.setState({
                            showSuccess: false,
                        }),
                    MODAL_TIME_OUT
                );
            })
            .catch((err) => {
                this.setState({
                    errorMessage: RequestUtils.xhrErrorCheckHelper(err),
                });
            });
    }

    deleteRoleCancel() {
        this.setState({
            showDelete: false,
            deleteName: '',
        });
    }

    saveJustification(val) {
        this.setState({ deleteJustification: val });
    }

    expandRole(memberName) {
        let expand = this.state.expand;
        const center = 'center';
        const left = 'left';
        let content = this.state.contents;
        let expandArray = this.state.expandTable;
        if (content[memberName] !== null) {
            content[memberName] = null;
            expandArray[memberName] = false;
            this.setState({
                contents: content,
                expandTable: expandArray,
            });
        } else {
            content[memberName] = expand[memberName].map((role, i) => {
                let deleteItem = this.deleteItem.bind(
                    this,
                    role.roleName,
                    memberName
                );
                return (
                    <FlexDiv key={role.roleName}>
                        <TDStyledMember align={left}>
                            {role.roleName}
                        </TDStyledMember>
                        <TDStyledIcon align={center}>
                            {role.expiration
                                ? this.dateUtils.getLocalDate(
                                      role.expiration,
                                      'UTC',
                                      'UTC'
                                  )
                                : null}
                        </TDStyledIcon>
                        <TDStyledIcon align={center}>
                            <Icon
                                icon={'trash'}
                                onClick={deleteItem}
                                color={colors.icons}
                                isLink
                                size={'1.25em'}
                                verticalAlign={'text-bottom'}
                            />
                        </TDStyledIcon>
                    </FlexDiv>
                );
            });
            expandArray[memberName] = true;
            this.setState({
                contents: content,
                expandTable: expandArray,
            });
        }
    }

    loadRoleByUser() {
        this.api
            .getRoleMembers(this.props.domain)
            .then((members) => {
                let expand = {};
                let contents = {};
                let expandArray = {};
                let fullNameArr = {};
                for (let i = 0; i < members.members.length; i++) {
                    let name = members.members[i].memberName;
                    expand[name] = members.members[i].memberRoles;
                    fullNameArr[name] = members.members[i].memberFullName;
                    contents[name] = null;
                    expandArray[name] = false;
                }
                this.setState({
                    list: members,
                    loaded: 'done',
                    expand: expand,
                    contents: contents,
                    expandTable: expandArray,
                    fullNames: fullNameArr,
                });
            })
            .catch((err) => {
                let message;
                if (err.statusCode === 0) {
                    window.location.reload();
                } else {
                    message = `Status: ${err.statusCode}. Message: ${err.body.message}`;
                }
                this.setState({
                    errorMessage: message,
                });
            });
    }

    onCloseAlert() {
        this.setState({
            showSuccess: false,
        });
    }

    render() {
        const { domain } = this.props;
        const center = 'center';
        const left = 'left';
        let deleteCancel = this.deleteRoleCancel.bind(this);
        let submitDelete = this.onSubmitDelete.bind(this, domain);
        let submitDeleteMember = this.onSubmitDeleteMember.bind(this, domain);
        let closeSuccess = this.onCloseAlert.bind(this);
        if (this.state.loaded === 'todo') {
            return <div data-testid='userroletable' />;
        }
        const rows =
            this.state.list.members &&
            this.state.list.members
                .filter((member) => {
                    return member.memberName.includes(
                        this.state.searchText.trim()
                    );
                })
                .sort((a, b) => {
                    return a.memberName.localeCompare(b.memberName);
                })
                .map((item, i) => {
                    let deleteItem = this.deleteItemMember.bind(
                        this,
                        item.memberName
                    );
                    let expandRole = this.expandRole.bind(
                        this,
                        item.memberName
                    );

                    let toReturn = [];

                    if (!this.state.contents[item.memberName]) {
                        toReturn.push(
                            <TrStyled key={item.memberName}>
                                <TDStyledMember align={left}>
                                    <LeftMarginSpan>
                                        <Icon
                                            icon={'arrowhead-down-circle'}
                                            onClick={expandRole}
                                            color={colors.icons}
                                            isLink
                                            size={'1.5em'}
                                            verticalAlign={'text-bottom'}
                                        />
                                    </LeftMarginSpan>
                                    {item.memberName +
                                        (this.state.fullNames[
                                            item.memberName
                                        ] !== undefined
                                            ? ' (' +
                                              this.state.fullNames[
                                                  item.memberName
                                              ] +
                                              ')'
                                            : '') +
                                        ' (' +
                                        item.memberRoles.length +
                                        ')'}
                                </TDStyledMember>
                                <TDStyledIcon align={center} />
                                <TDStyledIcon align={center}>
                                    <Icon
                                        icon={'trash'}
                                        onClick={deleteItem}
                                        color={colors.icons}
                                        isLink
                                        size={'1.25em'}
                                        verticalAlign={'text-bottom'}
                                    />
                                </TDStyledIcon>
                            </TrStyled>
                        );
                    } else {
                        toReturn.push(
                            <TrStyled key={item.memberName}>
                                <StyledTd>
                                    <StyledTable>
                                        <FlexDiv>
                                            <TDStyledMember align={left}>
                                                <LeftMarginSpan>
                                                    <Icon
                                                        icon={
                                                            'arrowhead-up-circle-solid'
                                                        }
                                                        onClick={expandRole}
                                                        color={colors.icons}
                                                        isLink
                                                        size={'1.5em'}
                                                        verticalAlign={
                                                            'text-bottom'
                                                        }
                                                    />
                                                </LeftMarginSpan>
                                                {item.memberName +
                                                    (this.state.fullNames[
                                                        item.memberName
                                                    ] !== undefined
                                                        ? ' (' +
                                                          this.state.fullNames[
                                                              item.memberName
                                                          ] +
                                                          ')'
                                                        : '') +
                                                    ' (' +
                                                    item.memberRoles.length +
                                                    ')'}
                                            </TDStyledMember>
                                            <TDStyledIcon align={center} />
                                            <TDStyledIcon align={center}>
                                                <Icon
                                                    icon={'trash'}
                                                    onClick={deleteItem}
                                                    color={colors.icons}
                                                    isLink
                                                    size={'1.25em'}
                                                    verticalAlign={
                                                        'text-bottom'
                                                    }
                                                />
                                            </TDStyledIcon>
                                        </FlexDiv>
                                        {this.state.contents[item.memberName]}
                                    </StyledTable>
                                </StyledTd>
                            </TrStyled>
                        );
                    }
                    return toReturn;
                });

        return (
            <StyleTable key='user-role-table' data-testid='userroletable'>
                <TableHeadStyled>
                    {this.state.showSuccess ? (
                        <Alert
                            isOpen={this.state.showSuccess}
                            title={
                                this.state.deleteMember
                                    ? 'Successfully deleted member from all roles'
                                    : 'Successfully deleted member from role '
                            }
                            type='success'
                            onClose={closeSuccess}
                        />
                    ) : null}
                    <StyledUserCol align={left}>MEMBER</StyledUserCol>
                    <StyledIconCol align={center}>
                        Expiration Date
                    </StyledIconCol>
                    <StyledIconCol align={center}>Delete</StyledIconCol>
                </TableHeadStyled>
                <DeleteModal
                    name={this.state.deleteName}
                    isOpen={this.state.showDelete}
                    cancel={deleteCancel}
                    submit={
                        this.state.deleteMember
                            ? submitDeleteMember
                            : submitDelete
                    }
                    message={
                        this.state.deleteMember
                            ? 'Are you sure you want to permanently delete the Member from all roles: '
                            : 'Are you sure you want to permanently delete the Member from Role: '
                    }
                    showJustification={this.props.justificationRequired}
                    onJustification={this.saveJustification}
                    errorMessage={this.state.errorMessage}
                />
                {rows}
            </StyleTable>
        );
    }
}
