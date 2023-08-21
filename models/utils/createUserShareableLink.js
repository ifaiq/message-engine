import randtoken from 'rand-token';
import ShareableLink from '../shareableLink.js';

function createUserShareableLink(userID) {
    const invitationToken = randtoken.generate(10);
    const shareableLink = new ShareableLink({ inviter: userID, token: invitationToken });
    shareableLink.save();
}

export default createUserShareableLink;
