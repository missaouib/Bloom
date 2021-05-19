import React, { useEffect , useState} from 'react';
import Avatar from 'antd/lib/avatar/avatar';
import {getAvatarColor} from '../../util/Colors';
import { formatDateTime } from '../../util/Helpers';
import './EditProfile.css';
import {Form, Input, notification, Button, Menu, Dropdown} from 'antd';
import {post} from 'axios';
import { getCurrentUser, getUserProfile } from '../../util/APIUtils';
import {  checkEditUsernameAvailability, checkEditEmailAvailability, editUserInfo } from '../../util/APIUtils';
import { 
    NAME_MIN_LENGTH, NAME_MAX_LENGTH, 
    USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH,
    EMAIL_MAX_LENGTH, ACCESS_TOKEN,
    API_BASE_URL
} from '../../constants';

const FormItem = Form.Item;

function EditProfileImage() {
    const [images, setImages] =  useState({
        value : null,
    })

    const onChangedImages = (e) => {
        setImages({
            ...images,
            value : e.target.files[0],
            validateStatus : 'success',
            errorMsg : null
        })
    }

    const handleImageSubmit = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('image', images.value);
      
        const config = {
            headers : {
                'Content-Type' : 'multipart/form-data',
                'Authorization' : `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
            }
        }

        return post(API_BASE_URL+'/accounts/edits/image', formData, config)
            .then(response => {
                notification.success({
                    message : 'Bloom',
                    description : 'Successfully edit profile image!'
                })
            })
            .catch(error => {
                notification.error({
                    message : 'Bloom',
                    description : error.message || 'Sorry Somthing was wrong'
                })
            })
    }

    return (
        <div className="edit-profile-image-container">
            {/* <form >
                <input type="file" onChange={(e) => {onChangedImages(e)}}/>
                <Button 
                        style={{
                            borderStyle: "none",
                            backgroundImage: "linear-gradient(135deg, #FFFABF, #D8DFEC, #D5C6E3)" 
                        }} 
                        type="primary" 
                        block shape ="round" 
                        htmlType="submit"
                        onClick={handleImageSubmit}
                    >
                    Save
                </Button>
            </form> */}
        </div>
    );
}

function EditProfile({currentUser}) {
    // 현재 edit 하고 있는 유저의 username, email을 제외하고 validate를 진행하는 코드를 만들어야함.
    const [user, setUser] = useState(null);

    useEffect(() => {   
        // 새로 리랜더링하면 에러나는건 react의 특징인가?
        console.log(currentUser.username)
        loadUserProfile(currentUser.username)
    }, [])

    const loadUserProfile = (username) => {

        getUserProfile(username)
            .then(response => {
                setUser(response);
            })
            .catch(error => {
                console.log(error.message)
            })
    } 

    useEffect(() => {
        console.log(user)

    }, [user])

    const [name, setName] = useState({
        value : '',
    });
    const [username, setUsername] = useState({
        value : '',
    })
    const [email, setEmail] = useState({
        value : '',
    })
    const [bio, setBio] = useState({
        value: '',
    })
    const [phoneNumber, setPhoneNumber] = useState({
        value : '',
    })

    const handleEditSubmit = () => {
        const UserEditInfo = {
            userId : user.id,
            name : name.value,
            username : username.value,
            email : email.value,
            bio : bio.value,
            phoneNumber : phoneNumber.value
        };

        const profileURL = "/users/" + user.username;

        editUserInfo(UserEditInfo)
            .then(response => {
                notification.success({
                    message: 'Polling App',
                    description: "Thank you! You're successfully registered. Please Login to continue!",
                }); 
                window.location.replace(profileURL);
            }).catch(error => {
                notification.error({
                    message: 'Polling App',
                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                });
            });
    }

    const onChangedName = (event) => {
        var { value } = event.target;
        setName({
            ...name,
            value : value,
            ...validateName()
        })
    }

    const onChangedUsername = (event) => {
        var { value } = event.target;

        setUsername({
            ...username,
            value : value,
            ...validateUsername()
        })
    }

    const onChangedEmail = (event) => {
        var { value } = event.target;

        setEmail({
            ...email,
            value : value,
            ...validateEmail()
        })
    }

    const onChangedBio = (event) => {
        var { value } = event.target;

        setBio({
            ...bio,
            value : value,
            validateStatus : 'success',
            errorMsg : null
        })
    }

    const onChangedPhoneNumber = (event) => {
        var { value } = event.target;

        setPhoneNumber({
            ...phoneNumber,
            value : value,
            validateStatus : 'success',
            errorMsg : null
        })
    }

    useEffect(() => {
        if(username.validateStatus === null){
            checkEditUsernameAvailability(username.value)
                .then(response => {
                    console.log(response)
                    if(response.available){
                        setUsername({
                            ...username,
                            value : username.value,
                            validateStatus : 'success',
                            errorMsg : null
                        })
                    }
                    else {
                        setUsername({
                            ...username, 
                            value : username.value,
                            validateStatus : 'error',
                            errorMsg : 'Username is already taken'
                        })
                    }
                })
                .catch(error => {
                    setUsername({
                        ...username,
                        value : username.value,
                        validateStatus : 'error',
                        errorMsg : 'Somthing was wrong'
                    })
                })
        }
    },[username])

    useEffect(() => {
        if(email.validateStatus === null) {
            checkEditEmailAvailability(email.value)
                .then(response => {
                    if(response.available) {
                        setEmail({
                            ...email,
                            validateStatus : 'success',
                            errorMsg : null
                        })
                    }
                    else {
                        setEmail({
                            ...email,
                            value : email.value,
                            validateStatus : 'error',
                            errorMsg : 'This Email is already registered'
                        })
                    }
                })   
                .catch(error => {
                    setEmail({
                        ...email,
                        value : email.value,
                        validateStatus : 'error',
                        errorMsg : 'error : '+ error
                    })
                })         
        }

    }, [email])

    const validateName = () => {
        if((name.value !== undefined) && (name.value.length < NAME_MIN_LENGTH)) {
            return {
                validateStatus: 'error',
                errorMsg: `Name is too short (Minimum ${NAME_MIN_LENGTH} characters needed.)`
            }
        } else if ((name.value !== undefined) && (name.value.length > NAME_MAX_LENGTH)) {
            return {
                validationStatus: 'error',
                errorMsg: `Name is too long (Maximum ${NAME_MAX_LENGTH} characters allowed.)`
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null,
              }; 
        }
    }

    const validateUsername = () => {
        if(username.value.length < USERNAME_MIN_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Username is too short (Minimum ${USERNAME_MIN_LENGTH} characters needed.)`
            }
        } else if (username.value.length > USERNAME_MAX_LENGTH) {
            return {
                validationStatus: 'error',
                errorMsg: `Username is too long (Maximum ${USERNAME_MAX_LENGTH} characters allowed.)`
            }
        } else {
           return {
               validateStatus : null,
               errorMsg : null
           }
        }
    }
    
    const validateEmail = () => {
        if(!email.value) {
            return {
                validateStatus: 'error',
                errorMsg: 'Email may not be empty'                
            }
        }

        const EMAIL_REGEX = RegExp('[^@ ]+@[^@ ]+\\.[^@ ]+');
        if(!EMAIL_REGEX.test(email.value)) {
            return {
                validateStatus: 'error',
                errorMsg: 'Email not valid'
            }
        }

        if(email.value.length > EMAIL_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Email is too long (Maximum ${EMAIL_MAX_LENGTH} characters allowed)`
            }
        }

        return {
            validateStatus: null,
            errorMsg: null
        }
    }
    
    return (
        <div className="edit-profile-container">
            <div className="edit-profile-base-container">
                <div className="edit-profile-menubar">
                    <div className="edit-profile">Edit Profile</div>
                </div>
                
                <div className="edit-profile-info-container">
                    <div className="for-profile-user-details">
                        <div className="user-avatar">
                            <Avatar  
                                style={{
                                    backgroundColor: getAvatarColor(user.name),
                                    width: "90px",
                                    height: "90px"
                                }} 
                                src={`data:image/jpeg;base64,${user.profileImage}`}
                            >
                            </Avatar>
                        </div>
                        <div className="user-detail-info">
                            <div className="user-summary">
                                <div className="username">{user.username}</div>
                                <div className="full-name">{user.name}</div>
                                <div className="user-joined">
                                    Joined {formatDateTime(user.joinedAt)}
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="edit-profile-image">
                        <div className="edit-profile-image-sub">Edit Profile image</div>
                        <EditProfileImage />
                    </div>

                    <div className="edit-profile-info-container">
                        <Form
                            onFindish
                            requiredMark="true"
                            onFinish={handleEditSubmit}
                        >
                            <FormItem
                                label="Full Name"
                                validateStatus={name.validateStatus}
                                help={name.errorMsg}
                            >
                                <Input 
                                    size="large"
                                    name="name"
                                    authoComplete="off"
                                    placeholder={name.value || "Please input your full name!"}
                                    allowClear="true"
                                    onChange={(e) => {onChangedName(e)}}
                                />
                            </FormItem>

                            <FormItem
                                label="Username"
                                validateStatus={username.validateStatus}
                                help={username.errorMsg}
                            >
                                <Input 
                                    size="large"
                                    name="username"
                                    authoComplete="off"
                                    placeholder={username.value || "Please input your username!"}
                                    allowClear="true"
                                    onChange={(e) => {onChangedUsername(e)}}
                                />
                            </FormItem>

                            <FormItem
                                label="Email"
                                validateStatus={email.validateStatus}
                                help={email.errorMsg}
                            >
                                <Input 
                                    size="large"
                                    name="email"
                                    authoComplete="off"
                                    placeholder={email.value || "Please input your email!"}
                                    onChange={(e) => {onChangedEmail(e)}}
                                />
                            </FormItem>

                            <FormItem
                                label="Bio"
                                validateStatus={bio.validateStatus}
                                help={bio.errorMsg}
                            >
                                <Input 
                                    size="large"
                                    name="bio"
                                    authoComplete="off"
                                    placeholder={bio.value || "personal information"}
                                    onChange={(e) => {onChangedBio(e)}}
                                />
                            </FormItem>
                            
                            <FormItem
                                label="phoneNumber"
                                validateStatus={phoneNumber.validateStatus}
                                help={phoneNumber.errorMsg}
                            >
                                <Input 
                                    size="large"
                                    name="phoneNumber"
                                    authoComplete="off"
                                    placeholder={phoneNumber.value || "Please input your phoneNumber"}
                                    onChange={(e) => {onChangedPhoneNumber(e)}}
                                />
                            </FormItem>

                            <FormItem>
                                <Button 
                                    style={{
                                        width: "100px",
                                        borderStyle: "none",
                                        backgroundImage: "linear-gradient(135deg, #FFFABF, #D8DFEC, #D5C6E3)" 
                                    }} 
                                    type="primary" 
                                    block shape ="round" 
                                    htmlType="submit"
                                >
                                    Save
                                </Button>
                            </FormItem>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditProfile;