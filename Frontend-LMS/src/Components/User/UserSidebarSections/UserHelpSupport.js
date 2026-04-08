import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import PulseLoader from 'react-spinners/PulseLoader';
import 'react-toastify/dist/ReactToastify.css';
import './UserHelpSupport.css';
import { BACKEND_BASEURL } from '../../helper';

const initialForm = {
  issueTitle: '',
  complaintMessage: '',
  issueCategory: 'Technical',
  priorityLevel: 'Medium',
  attachmentName: '',
  attachmentData: '',
};

const statusClassMap = {
  Open: 'open',
  'In Progress': 'in-progress',
  Resolved: 'resolved',
};

const UserHelpSupport = () => {
  const [formState, setFormState] = useState(initialForm);
  const [faqs, setFaqs] = useState([]);
  const [issues, setIssues] = useState([]);
  const [contact, setContact] = useState({
    phone: '(+91) 82278 72722',
    email: 'support@skilllms.in',
    chatLabel: 'Live chat coming soon',
  });
  const [expandedFaq, setExpandedFaq] = useState(0);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const userName = useMemo(() => {
    const userLoginResponse = localStorage.getItem('UserLoginResponse');
    if (!userLoginResponse) {
      return '';
    }
    const user = JSON.parse(userLoginResponse);
    return user?.username || '';
  }, []);

  const fetchFaqs = useCallback(async () => {
    try {
      const response = await axios.get(`${BACKEND_BASEURL}/student/faqs`);
      setFaqs(response?.data?.faqs || []);
      if (response?.data?.contact) {
        setContact(response.data.contact);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  }, []);

  const fetchIssues = useCallback(async () => {
    if (!userName) {
      setIssues([]);
      return;
    }

    setLoadingIssues(true);
    try {
      const response = await axios.get(`${BACKEND_BASEURL}/student/issues?userName=${encodeURIComponent(userName)}`);
      setIssues(response?.data?.data || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Unable to load your raised issues right now.');
    } finally {
      setLoadingIssues(false);
    }
  }, [userName]);

  useEffect(() => {
    const loadPage = async () => {
      setLoadingPage(true);
      await Promise.all([fetchFaqs(), fetchIssues()]);
      setLoadingPage(false);
    };

    loadPage();
  }, [fetchFaqs, fetchIssues]);

  const handleInputChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFormState((prev) => ({
        ...prev,
        attachmentName: '',
        attachmentData: '',
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormState((prev) => ({
        ...prev,
        attachmentName: file.name,
        attachmentData: typeof reader.result === 'string' ? reader.result : '',
      }));
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormState(initialForm);
  };

  const handleSubmit = async () => {
    if (!userName) {
      toast.error('User session not found. Please log in again.');
      return;
    }

    if (!formState.issueTitle.trim() || !formState.complaintMessage.trim()) {
      toast.error('Please fill in both issue title and description.');
      return;
    }

    setLoadingSubmit(true);
    try {
      await axios.post(`${BACKEND_BASEURL}/student/issue`, {
        ...formState,
        userName,
        isResolved: false,
      });
      toast.success('Issue submitted successfully. Your ticket is now being tracked.');
      resetForm();
      await fetchIssues();
    } catch (error) {
      console.error('Error submitting issue:', error);
      toast.error('Unable to submit your issue right now. Please try again.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Just now';
    }
    return format(new Date(dateString), 'do MMM yyyy, HH:mm');
  };

  const totalOpenIssues = issues.filter((issue) => issue?.issueStatus === 'Open').length;
  const totalResolvedIssues = issues.filter((issue) => issue?.issueStatus === 'Resolved').length;

  return (
    <div className="helpSupportPage">
      <ToastContainer />
      {loadingPage ? (
        <div className="helpSupportLoader">
          <PulseLoader size={14} color="#ff8e1f" />
        </div>
      ) : (
        <>
          <div className="helpSupportHero">
            <div className="helpSupportHeroBadge">SUPPORT DESK</div>
            <h1>Help &amp; Support</h1>
            <p>Find answers fast, raise issues with full context, and track every support update without leaving your LMS flow.</p>
            <div className="helpSupportStats">
              <div className="helpSupportStatCard">
                <span className="helpSupportStatValue">{issues.length}</span>
                <span className="helpSupportStatLabel">Total Tickets</span>
              </div>
              <div className="helpSupportStatCard">
                <span className="helpSupportStatValue">{totalOpenIssues}</span>
                <span className="helpSupportStatLabel">Open Issues</span>
              </div>
              <div className="helpSupportStatCard">
                <span className="helpSupportStatValue">{totalResolvedIssues}</span>
                <span className="helpSupportStatLabel">Resolved</span>
              </div>
            </div>
          </div>

          <div className="helpSupportGrid">
            <section className="helpSupportCard faqCard">
              <div className="helpSupportSectionHeader">
                <div>
                  <span className="helpSupportEyebrow">FAQS</span>
                  <h2>Frequently Asked Questions</h2>
                </div>
              </div>

              <div className="faqAccordionList">
                {faqs.map((faq, index) => {
                  const isOpen = expandedFaq === index;
                  return (
                    <div className={`faqAccordionItem ${isOpen ? 'active' : ''}`} key={faq.question}>
                      <button
                        type="button"
                        className="faqAccordionToggle"
                        onClick={() => setExpandedFaq(isOpen ? -1 : index)}
                      >
                        <span>{faq.question}</span>
                        <span className="faqAccordionIcon">{isOpen ? '-' : '+'}</span>
                      </button>
                      {isOpen && <div className="faqAccordionAnswer">{faq.answer}</div>}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="helpSupportCard issueFormCard">
              <div className="helpSupportSectionHeader">
                <div>
                  <span className="helpSupportEyebrow">REPORT AN ISSUE</span>
                  <h2>Tell us what went wrong</h2>
                </div>
              </div>

              <div className="helpSupportForm">
                <div className="helpSupportField">
                  <label htmlFor="issueTitle">Issue title</label>
                  <input
                    id="issueTitle"
                    type="text"
                    placeholder="Unable to access live class recording"
                    value={formState.issueTitle}
                    onChange={(event) => handleInputChange('issueTitle', event.target.value)}
                  />
                </div>

                <div className="helpSupportFieldRow">
                  <div className="helpSupportField">
                    <label htmlFor="issueCategory">Category</label>
                    <select
                      id="issueCategory"
                      value={formState.issueCategory}
                      onChange={(event) => handleInputChange('issueCategory', event.target.value)}
                    >
                      <option value="Technical">Technical</option>
                      <option value="Course">Course</option>
                      <option value="Payment">Payment</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="helpSupportField">
                    <label htmlFor="priorityLevel">Priority</label>
                    <select
                      id="priorityLevel"
                      value={formState.priorityLevel}
                      onChange={(event) => handleInputChange('priorityLevel', event.target.value)}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="helpSupportField">
                  <label htmlFor="complaintMessage">Description</label>
                  <textarea
                    id="complaintMessage"
                    placeholder="Describe the issue, what you expected, and what happened instead."
                    value={formState.complaintMessage}
                    onChange={(event) => handleInputChange('complaintMessage', event.target.value)}
                  />
                </div>

                <div className="helpSupportField">
                  <label htmlFor="attachment">Upload screenshot (optional)</label>
                  <input id="attachment" type="file" accept="image/*" onChange={handleFileUpload} />
                  {formState.attachmentName && <div className="attachmentName">Attached: {formState.attachmentName}</div>}
                </div>

                <div className="helpSupportActions">
                  <button type="button" className="secondaryButton" onClick={resetForm}>
                    Clear
                  </button>
                  <button type="button" className="primaryButton" onClick={handleSubmit}>
                    {loadingSubmit ? <PulseLoader size={8} color="#ffffff" /> : 'Submit Issue'}
                  </button>
                </div>
              </div>
            </section>
          </div>

          <div className="helpSupportBottomGrid">
            <section className="helpSupportCard issueTrackingCard">
              <div className="helpSupportSectionHeader">
                <div>
                  <span className="helpSupportEyebrow">TRACKING</span>
                  <h2>Raised Issues</h2>
                </div>
              </div>

              {loadingIssues ? (
                <div className="helpSupportLoader compact">
                  <PulseLoader size={12} color="#219ebc" />
                </div>
              ) : issues.length === 0 ? (
                <div className="emptySupportState">No issues submitted yet. Raise your first ticket from the form above.</div>
              ) : (
                <div className="issueList">
                  {issues.map((issue) => (
                    <div className="issueItem" key={issue.grievanceId}>
                      <div className="issueItemHeader">
                        <div>
                          <div className="issueTitleRow">
                            <h3>{issue.issueTitle}</h3>
                            <span className={`issueStatusBadge ${statusClassMap[issue.issueStatus] || 'open'}`}>
                              {issue.issueStatus}
                            </span>
                          </div>
                          <div className="issueMeta">
                            <span>{issue.ticketId}</span>
                            <span>{formatDate(issue.creationTimeStamp)}</span>
                            <span>{issue.issueCategory}</span>
                            <span>{issue.priorityLevel} Priority</span>
                          </div>
                        </div>
                      </div>
                      <p className="issueDescription">{issue.complaintMessage}</p>
                      {issue.adminReply && (
                        <div className="adminReplyBox">
                          <div className="adminReplyLabel">Support Response</div>
                          <div>{issue.adminReply}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="helpSupportCard contactCard">
              <div className="helpSupportSectionHeader">
                <div>
                  <span className="helpSupportEyebrow">CONTACT</span>
                  <h2>Other ways to reach us</h2>
                </div>
              </div>

              <div className="contactOptionList">
                <div className="contactOption">
                  <div className="contactIcon">P</div>
                  <div>
                    <div className="contactLabel">Phone Support</div>
                    <div className="contactValue">{contact.phone}</div>
                  </div>
                </div>
                <div className="contactOption">
                  <div className="contactIcon">E</div>
                  <div>
                    <div className="contactLabel">Email Support</div>
                    <div className="contactValue">{contact.email}</div>
                  </div>
                </div>
                <div className="contactOption">
                  <div className="contactIcon">C</div>
                  <div>
                    <div className="contactLabel">Chat Support</div>
                    <div className="contactValue">{contact.chatLabel}</div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default UserHelpSupport;
