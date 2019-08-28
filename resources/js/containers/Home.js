import React, { Component } from 'react';
import EmployeeList from "./EmployeeList";
import Header from "../components/Header";

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 'list',
            selectedEmployeeId: '',
        };
        this.login = this.login.bind(this);
        this.handleChangePage = this.handleChangePage.bind(this);
        this.setSelectedEmployeeId = this.setSelectedEmployeeId.bind(this);
    }

    componentDidMount() {

    }

    handleChangePage(page) {
        this.setState({ page: page });
    }

    setSelectedEmployeeId(id) {
        this.setState({
            selectedEmployeeId: id
        });
    }

    login() {
        console.log('login');
    }

    render() {
        return (
            <div className="container">
                <Header
                    login={this.props.login}
                />
                {
                    this.state.page === 'list' &&
                    <EmployeeList
                        handleChangePage={this.handleChangePage}
                        setSelectedEmployeeId={this.setSelectedEmployeeId}
                    />
                }
            </div>
        );
    }
}
