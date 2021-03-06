import React from 'react'
import Link from 'next/link'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { ellipsis } from 'polished'

import { MediaQueryConsumer } from '~/components/new/media-query'
import Header from '~/components/new/header'

import Profile from '../../containers/Profile'
import CheckIcon from '../icons/check'
import ArrowIcon from '../icons/arrow-right'

const styles = {
  bold: {
    fontWeight: 800
  }
}

class Navigation extends React.Component {
  state = {
    dropdown: false
  }
  toggleDropdown = () => {
    this.setState({ dropdown: !this.state.dropdown })
  }

  renderLesson (course, lesson) {
    const { courseId, lessonId } = this.props
    const selected = (course.id === courseId && lesson.id === lessonId)
    const totalSteps = (lesson.steps || []).length
    const finishedSteps = (lesson.steps || []).filter(step => step.visited).length
    const finished = totalSteps === finishedSteps && totalSteps > 0
    const started = finishedSteps > 0

    return (
      <li key={lesson.id}>
        <Link
          href={`/learn/content?course=${course.id}&lesson=${lesson.id}`}
          as={`/learn/${course.id}/${lesson.id}`}
        >
          <a className={classNames('f5', { selected, fw7: selected, finished, started })}>
            <span className='step' title={finishedSteps + ' / ' + totalSteps + ' finished'}>
              { finished && <CheckIcon color='#2BDB66' /> }
            </span>
            <span className='label'>{lesson.name}</span>
          </a>
        </Link>
        <style jsx>{`
          li {
            list-style: none;
            margin: 12px 0;
          }

          a {
            display: flex;
            align-items: center;
            color: unset;
            text-decoration: none;
          }
          a:hover {
            color: gray;
          }
          .step {
            display: inline-block;
            margin-left: -1.25rem;
            margin-right: -7px;
            width: 7px;
            height: 7px;
            min-width: 7px;
            border-radius: 50%;
            background: #efefef;
            transform: translateX(-4px);
            transition: background .5s ease;
          }
          // .started .step {
          //   background: #b1b1b1;
          // }
          .selected .step {
            margin-right: -9px;
            width: 9px;
            height: 9px;
            min-width: 9px;
            background: #111;
            transform: translateX(-5px);
          }
          .finished .step {
            width: 16px;
            height: 16px;
            line-height: 16px;
            margin-right: -16px;
            background: white;
            transform: translateX(-8px);
          }
          .label {
            margin-left: 1.25rem;
          }
        `}</style>
      </li>
    )
  }

  renderCourse (course, isMobile) {
    return (
      <div className="course" key={course.id}>
        <h3 className="f6 fw6">{course.name}</h3>
        <ul>
          {course.lessons.map((l, i) => this.renderLesson(course, l, i))}
        </ul>
        <style jsx>{`
          h3 {
            text-transform: uppercase;
            margin-bottom: 12px;
          }

          .course {
            ${
              isMobile ? `
                padding-top: 1rem;
              ` : `
                padding-top: 3rem;
              `
            }
            padding-left: 1.25rem;
            margin-left: 1rem;
            border-left: 1px solid #efefef;
          }
          :global(.course):last-of-type {
            padding-bottom: 3rem;
          }

          ul {
            padding: 0;
            margin: 0;
          }
        `}</style>
      </div>
    )
  }

  render () {
    const { courses } = this.props
    return (<MediaQueryConsumer>{({isMobile}) => {
      if (isMobile) {
        const { courseId, lessonId } = this.props
        const { dropdown } = this.state

        let currentLessonName = courses
          .filter(course => course.id === courseId)[0]
          .lessons
          .filter(lesson => lesson.id === lessonId)[0]
          .name
            
        return <Header height={56} zIndex={999} offset={64 + 31} shadow defaultActive>
          <div className='fixed-navigation-container'>
            <div className={`navigation-area dropdown${dropdown ? '' : ' courses-closed'}`}>
              {courses.map((c, i) => this.renderCourse(c, true))}
            </div>
            <div role='button' className='no-tap-highlight current f5 fw6' onClick={this.toggleDropdown}>
              <span style={{ 
                verticalAlign: 'middle',
                marginRight: 7,
                display: 'inline-block',
                lineHeight: 0
              }}><ArrowIcon/></span><span style={ellipsis()}>{currentLessonName}</span>
            </div>
            <Profile isMobile={true}/>
            <style jsx>{`
              .fixed-navigation-container {
                position: relative;
                display: flex;
                height: 56px;
                width: 100%;
                padding: 0 1rem;
                align-items: center;
                justify-content: space-between;
              }
              .current {
                flex: 1;
                display: flex;
                height: 100%;
                align-items: center;
                padding-right: 1rem;
                overflow: hidden;
                cursor: pointer;
              }
              .navigation-area.dropdown {
                position: absolute;
                display: flex;
                align-items: flex-start;
                flex-direction: column;
                left: 0;
                top: 100%;
                bottom: -50vh;
                width: 100%;
                padding: 0 .65rem;
                background: white;
                border-top: 1px solid #efefef;
                box-shadow: 0 10px 20px rgba(0, 0, 0, .1);
                transition: bottom .5s ease;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
              }
              .navigation-area.dropdown.courses-closed {
                bottom: 100%;
              }
            `}</style>
          </div>
        </Header>
      }
      return <>
        <Profile isMobile={false}/>
        <div className='navigation-area'>
          {courses.map((c, i) => this.renderCourse(c))}
          <style jsx>{`
            .navigation-area {
              display: flex;
              flex-direction: column;
            }
          `}</style>
        </div>
      </>
    }}</MediaQueryConsumer>)
  }
}

Navigation.propTypes = {
  courses: PropTypes.array.isRequired,
  courseId: PropTypes.string.isRequired,
  lessonId: PropTypes.string.isRequired
}

Navigation.courseFragment = (c, props) => c.createFragment(`
  fragment on Course {
    id
    name
    lessons {
      id
      name
      ${
        (props.initialState.loginToken && props.__nextData.Profile.user) ? `
          steps {
            id
            visited
          }` : ''
      }
    }
  }
`)

Navigation.courseDetailedFragment = (c) => c.createFragment(`
  fragment on Course {
    id
    name
    lessons {
      id
      name
      steps {
        id
        visited
      }
    }
  }
`)

export default Navigation
