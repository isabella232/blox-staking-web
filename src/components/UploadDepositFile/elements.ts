import styled from "styled-components";

const DropZoneContainer = styled.div`
  & .MuiDropzoneArea-root {
    background-image: url('/images/drop_zone_icon.svg'), url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='4' ry='4' stroke='rgba(91, 108, 132, 1)' stroke-width='3' stroke-dasharray='10%2c 10' stroke-dashoffset='30' stroke-linecap='square'/%3e%3c/svg%3e");
    background-repeat: no-repeat, repeat;
    background-color: #FAFAFA;
    animation: none !important;
    background-position: center !important;
    border: none;
    background-size: auto !important;
    border-radius: 4px;
  }

  & .MuiDropzoneArea-active {
    background-color: red !important;
  }

  .MuiDropzonePreviewList-root {
    display: none;
  }

  & .MuiDropzoneArea-text {
    padding-top: 30px;
    color: rgba(215, 215, 215, 1);
    font-size: 18px;
  }

  & .MuiDropzoneArea-icon {
    display: none;
    color: rgba(215, 215, 215, 1);
  }

  & .MuiDropzonePreviewList-imageContainer {
    margin: auto;
  }

  & .MuiDropzonePreviewList-image {
    margin-top: 20px;
    width: 30px;
    height: 30px;
  }
`;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 35px 115px 0px 115px;
  position: relative;
  background-color: ${({theme}) => theme.gray100};
`;

const UploadWrapper = styled.div`
  width: 551px;
`;

const SubTitleWrapper = styled.div`
  width: 560px;
  display: flex;
  align-items: center;
`;

const FileApproval = styled.div`
  display: flex;
  padding: 10px;
  background-color: white;
  justify-content: space-between;
  text-align: center;
  align-items: center;
  align-content: center;
  height: 50px;
  box-sizing: border-box;
  border: 1px solid black;
  border-radius: 6px;
  margin-top: 12px;
`;

const ApprovedIcon = styled.img`
  float: left;
  width: 30px;
  height: 39px;
  margin-right: 10px;
`;

const RemoveIcon = styled.img`
  cursor: pointer;
`;

const FileName = styled.div`
  width: 100%;
  text-align: left;
`;

const ErrorMessage = styled.div`
  width: auto;
  max-width: 560px;
  padding: 8px 16px;
  color: ${({theme}) => theme.warning900};
  border: 2px solid ${({theme}) => theme.warning900};
  border-radius: 4px;
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
`;

const IconWrapper = styled.div`
  margin-right: 12px;
`;

const ErrorText = styled.div``;

const Deposit = styled.button<{ isDisabled: boolean }>`
  display: block;
  width: 250px;
  height: 40px;
  color: white;
  font-weight: bold;
  border-radius: 10px;
  border: none;
  margin-top: 20px;
  cursor: pointer;
  outline: none;
  text-align: center;
  align-content: center;
  vertical-align: middle;
  background-color: ${({theme, isDisabled}) => isDisabled ? theme.gray400 : theme.primary900};

  &:hover {
    color: ${({theme, isDisabled}) => isDisabled ? null : theme.primary400};
  }

  &:active {
    color: ${({theme, isDisabled}) => isDisabled ? null : theme.primary800};
  }`;

const DoNotDeposit = styled.p`
  width: 250px;
  color: #2536b8;
  margin-top: 10px;
  text-align: center;
  cursor: pointer;
`;

export {Deposit, DoNotDeposit, DropZoneContainer, ErrorMessage, ErrorText, FileApproval, FileName, ApprovedIcon, RemoveIcon, IconWrapper, SubTitleWrapper, UploadWrapper, Wrapper}